const axios = require("axios");
const sharp = require("sharp");
const logger = require("firebase-functions/logger");
const { swarmyURL } = require("../config");

const uploadImageToSwarmy = async (imageData) => {
  try {
    const fileSizeInBytes = Buffer.byteLength(imageData, "base64");
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (fileSizeInBytes > maxSizeInBytes) {
      throw new Error("File size exceeds the 2MB limit.");
    }

    const imageBuffer = Buffer.from(imageData, "base64");

    const imageInfo = await sharp(imageBuffer).metadata();
    if (!["png", "jpeg", "gif"].includes(imageInfo.format)) {
      throw new Error("Only PNG, JPG, or GIF images are allowed.");
    }

    let sanitizedImage;
    let contentType;
    let fileExtension;

    if (imageInfo.format === "gif") {
      sanitizedImage = imageBuffer;
      contentType = "image/gif";
      fileExtension = ".gif";
    } else {
      sanitizedImage = await sharp(imageBuffer)
        .resize(200, 200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toBuffer();
      contentType = "image/jpeg";
      fileExtension = ".jpg";
    }

    const sanitizedBase64 = sanitizedImage.toString("base64");

    const result = await axios.post(swarmyURL, {
      name: Math.random().toString(36).substring(2, 15).concat(fileExtension),
      contentType: contentType,
      base64: sanitizedBase64,
    });

    logger.log("Successfully uploaded sanitized image to hash:", result);

    return {
      success: true,
      hash: result.data.swarmReference,
    };
  } catch (error) {
    logger.error("Error uploading image to hash:", error);
    throw error;
  }
};

// const getImageFromSwarmy = async (cid) => {
//   try {
//     const response = await axios.get(swarmyURLWithReference(cid));
//     if (response.error) {
//       throw new Error(response.error);
//     }
//     logger.log("Successfully fetched image from CID:", response);
//     return { data: response.data };
//   } catch (error) {
//     logger.error(`Error fetching image for CID ${cid}:`, error);
//     throw error;
//   }
// };

module.exports = {
  uploadImageToSwarmy,
  // getImageFromSwarmy,
};
