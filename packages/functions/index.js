const logger = require("firebase-functions/logger");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions");

setGlobalOptions({ region: "europe-west1" });
initializeApp();

const cors = { cors: true };

const { fetchContractLogs } = require("./src/services/contractLogs");
const { updateActiveAds } = require("./src/services/activeAds");
const { fetchGovernanceEvents } = require("./src/services/governance");
const { uploadImageToSwarmy } = require("./src/services/swarmy");

exports.scheduledFetchContractLogs = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "UTC",
  },
  async () => {
    logger.log("Starting scheduled contract log fetch");
    const result = await fetchContractLogs();
    logger.log("Completed scheduled contract log fetch:", result);
    return null;
  },
);

exports.scheduledUpdateActiveAds = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "UTC",
  },
  async () => {
    logger.log("Starting scheduled active ads update");
    const result = await updateActiveAds();
    logger.log("Completed scheduled active ads update:", result);
    return null;
  },
);

exports.scheduledGovernanceEventsFetch = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "Europe/London",
  },
  async () => {
    try {
      logger.log("Starting scheduled governance events fetch");
      const result = await fetchGovernanceEvents();
      logger.log("Completed scheduled governance events fetch:", result);
      return result;
    } catch (error) {
      logger.error("Error in scheduled governance events fetch:", error);
      throw error;
    }
  },
);

exports.uploadImageToSwarmy = onRequest(cors, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ error: "Method not allowed. Please use POST." });
    }

    if (!req.body || !req.body.imageData) {
      return res.status(400).json({ error: "No image data provided." });
    }

    const result = await uploadImageToSwarmy(req.body.imageData);
    return res.status(200).json(result);
  } catch (error) {
    logger.error("Error uploading image to hash:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to upload image to hash",
    });
  }
});

exports.getAds = onRequest(cors, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ error: "Method not allowed. Please use POST." });
    }

    if (!req.body) {
      return res.status(400).json({ error: "No request body provided." });
    }

    if (!req.body.handle || typeof req.body.handle !== "string") {
      return res.status(400).json({ error: "A valid handle is required." });
    }

    logger.log("Request received for handle:", req.body.handle);
    logger.log("Request body:", JSON.stringify(req.body));

    const amountOfAds = req.body.amountOfAds || null;
    const getAllAds = req.body.getAllAds || false;

    logger.log("Amount of ads requested:", amountOfAds);
    logger.log("Get all ads flag:", getAllAds);

    const db = getFirestore();

    const activeAdsSnapshot = await db.collection("active_ads").get();

    if (activeAdsSnapshot.empty) {
      logger.log("No active ads found in database");
      return res.status(200).json({
        success: true,
        ads: [],
      });
    }

    const ads = [];
    activeAdsSnapshot.forEach((doc) => {
      const adData = doc.data();
      logger.log("Ad data from Firestore:", JSON.stringify(adData));
      ads.push({
        hash: adData.hash,
        link: adData.link,
        description: adData.description,
        expiryTime: adData.expiryTime,
        buyer: adData.buyer,
      });
    });

    logger.log("Total ads retrieved from database:", ads.length);
    logger.log("First ad data:", JSON.stringify(ads[0]));

    if (!getAllAds) {
      for (let i = ads.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ads[i], ads[j]] = [ads[j], ads[i]];
      }
      logger.log("Ads shuffled");
    }

    const limitedAds = getAllAds
      ? ads
      : amountOfAds
        ? ads.slice(0, amountOfAds)
        : ads;

    logger.log("Number of ads after limiting:", limitedAds.length);

    if (getAllAds) {
      logger.log("Processing all ads to add URLs");
      const adsWithUrls = await Promise.all(
        limitedAds.map(async (ad) => {
          try {
            logger.log("Converting hash to URL:", ad.hash);
            return {
              url: `https://api.swarmy.cloud/bzz/${ad.hash}/`,
              link: ad.link,
              description: ad.description,
              expiryTime: ad.expiryTime,
              hash: ad.hash,
              buyer: ad.buyer,
            };
          } catch (error) {
            logger.error(`Error converting hash ${ad.hash}:`, error);
            return ad;
          }
        }),
      );

      const userData = {
        timestamp: new Date().toISOString(),
        userAgent: req.headers["user-agent"] || "",
        origin: req.headers.origin || req.headers.referer || "",
        host: req.headers.host || "",
        acceptLanguage: req.headers["accept-language"] || "",
        handle: req.body.handle,
        buyer: ads.map((ad) => ad.buyer),
        ads,
      };
      try {
        await db.collection("ad_requests").add(userData);
        logger.log("User data collected successfully");
      } catch (err) {
        logger.error("Error storing user data:", err);
      }

      logger.log("Final ads with URLs:", JSON.stringify(adsWithUrls));
      return res.status(200).json({
        success: true,
        ads: adsWithUrls,
      });
    } else {
      const ad = limitedAds.length > 0 ? limitedAds[0] : null;

      if (!ad) {
        logger.log("No ads available after filtering");
        return res.status(200).json({
          success: true,
          ads: [],
        });
      }

      logger.log("Converting single ad hash to URL:", ad.hash);

      const responseData = {
        success: true,
        result: {
          url: `https://api.swarmy.cloud/bzz/${ad.hash}/`,
          link: ad.link,
          description: ad.description,
          expiryTime: ad.expiryTime,
          hash: ad.hash,
        },
      };

      const userData =
        amountOfAds === 1
          ? {
              timestamp: new Date().toISOString(),
              userAgent: req.headers["user-agent"] || "",
              origin: req.headers.origin || req.headers.referer || "",
              host: req.headers.host || "",
              acceptLanguage: req.headers["accept-language"] || "",
              handle: req.body.handle,
              url: `https://api.swarmy.cloud/bzz/${ad.hash}/`,
              link: ad.link,
              description: ad.description,
              expiryTime: ad.expiryTime,
              buyer: [ad.buyer],
            }
          : {
              timestamp: new Date().toISOString(),
              userAgent: req.headers["user-agent"] || "",
              origin: req.headers.origin || req.headers.referer || "",
              host: req.headers.host || "",
              acceptLanguage: req.headers["accept-language"] || "",
              handle: req.body.handle,
              link: ad.link,
              description: ad.description,
              expiryTime: ad.expiryTime,
              buyer: [ad.buyer],
            };
      try {
        await db.collection("ad_requests").add(userData);
        logger.log("User data collected successfully");
      } catch (err) {
        logger.error("Error storing user data:", err);
      }

      logger.log("Final response data:", JSON.stringify(responseData));
      return res.status(200).json(responseData);
    }
  } catch (error) {
    logger.error("Error getting ads:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get ads",
    });
  }
});

exports.getImageFromSwarmy = onRequest(cors, async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ error: "Method not allowed. Please use GET." });
    }

    if (!req.query.cid) {
      return res.status(400).json({ error: "CID is required." });
    }

    const cids = req.query.cid.split(",");
    logger.log("Fetching images from Swarmy:", cids);

    const responses = await Promise.all(
      cids.map(async (cid) => {
        try {
          return { data: `https://api.swarmy.cloud/bzz/${cid}/` };
        } catch (error) {
          logger.error(`Error fetching image for CID ${cid}:`, error);
          return { error: error.message };
        }
      }),
    );

    res.set("Content-Type", "application/json");
    res.json({
      success: true,
      data: responses,
    });
  } catch (error) {
    logger.error("Error fetching images from Swarmy:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch images from Swarmy",
    });
  }
});

exports.fetchGovernanceEventsManual = onRequest(cors, async (req, res) => {
  try {
    logger.log("Manual governance events fetch requested");
    const result = await fetchGovernanceEvents();
    logger.log("Completed manual governance events fetch:", result);
    return res.status(200).json({
      success: true,
      message: "Governance events fetched successfully",
      result,
    });
  } catch (error) {
    logger.error("Error in manual governance events fetch:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch governance events",
    });
  }
});
