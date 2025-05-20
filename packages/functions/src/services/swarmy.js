const axios = require("axios");
const sharp = require("sharp");
const logger = require("firebase-functions/logger");
const { swarmyURL, swarmyURLWithReference } = require("../config");

const uploadImageToSwarmy = async (imageData) => {
  try {
    const fileSizeInBytes = Buffer.byteLength(imageData, "base64");
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (fileSizeInBytes > maxSizeInBytes) {
      throw new Error("File size exceeds the 2MB limit.");
    }

    const imageBuffer = Buffer.from(imageData, "base64");

    const imageInfo = await sharp(imageBuffer).metadata();
    if (!["png", "jpeg"].includes(imageInfo.format)) {
      throw new Error("Only PNG or JPG images are allowed.");
    }

    const sanitizedImage = await sharp(imageBuffer)
      .resize(200, 200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer();

    const sanitizedBase64 = sanitizedImage.toString("base64");

    const result = await axios.post(swarmyURL, {
      name: Math.random().toString(36).substring(2, 15)
        .concat(".jpg"),
      contentType: "application/octet-stream",
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

const getImageFromSwarmy = async (cid) => {
  try {
    const response = await axios.get(swarmyURLWithReference(cid));
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data };
  } catch (error) {
    logger.error(`Error fetching image for CID ${cid}:`, error);
    throw error;
  }
};

module.exports = {
  uploadImageToSwarmy,
  getImageFromSwarmy,
};
