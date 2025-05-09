const { ethers } = require("ethers");
const logger = require("firebase-functions/logger");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const { PinataSDK } = require("pinata");
const abi = require("./abi");
const { setGlobalOptions } = require("firebase-functions");
const dotenv = require("dotenv");

dotenv.config();

setGlobalOptions({ region: "europe-west1" });
initializeApp();
const cors = [
  /localhost(:\d+)?$/,
  /web\.app$/,
  /firebase\.com$/,
  /billboard\.ink$/,
];

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_API_KEY,
  pinataGateway: process.env.PINATA_GATEWAY,
});
const rpcUrl = `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API}`;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  "0x0b7FAA59F15c3a1fD0D29EF1cCBe70Ec80e073AD",
  abi,
  provider,
);

const fetchContractLogs = async () => {
  try {
    const db = getFirestore();
    const currentBlock = await provider.getBlockNumber();

    const lastRunRef = db.collection("contract_logs_metadata").doc("last_run");
    const lastRunDoc = await lastRunRef.get();

    let lastProcessedBlock = currentBlock - 10000000;

    if (lastRunDoc.exists) {
      lastProcessedBlock = lastRunDoc.data().lastProcessedBlock;
    }

    const filterPurchased = contract.filters.BillboardPurchased();
    const filterExtended = contract.filters.BillboardExtended();
    const logsPurchased = await contract.queryFilter(
      filterPurchased,
      lastProcessedBlock + 1,
      currentBlock,
    );
    const logsExtended = await contract.queryFilter(
      filterExtended,
      lastProcessedBlock + 1,
      currentBlock,
    );

    const batch = db.batch();

    logsPurchased.forEach((log) => {
      const logData = {
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: new Date().toISOString(),
        buyer: log.args[0],
        expiryTime: log.args[1],
        description: log.args[2],
        link: log.args[3],
        ipfsHash: log.args[4],
      };

      const logRef = db.collection("contract_logs").doc(log.transactionHash);
      batch.set(logRef, logData);
    });

    logsExtended.forEach((log) => {
      const logData = {
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: new Date().toISOString(),
        buyer: log.args[0],
        expiryTime: log.args[2],
      };

      const logRef = db.collection("contract_logs").doc(log.transactionHash);
      batch.set(logRef, logData);
    });

    batch.set(
      lastRunRef,
      {
        lastProcessedBlock: currentBlock,
        lastRunTimestamp: new Date().toISOString(),
      },
      { merge: true },
    );

    await batch.commit();

    const totalLogs = logsPurchased.length + logsExtended.length;
    logger.log(
      `Successfully processed ${totalLogs} logs from the contract (blocks ${
        lastProcessedBlock + 1
      } to ${currentBlock})`,
    );
    return {
      success: true,
      count: totalLogs,
      fromBlock: lastProcessedBlock + 1,
      toBlock: currentBlock,
    };
  } catch (error) {
    logger.error("Error fetching contract logs:", error);
    return { success: false, error: error.message };
  }
};

exports.scheduledFetchContractLogs = onSchedule(
  {
    schedule: "every 12 hours",
    timeZone: "UTC",
  },
  async () => {
    logger.log("Starting scheduled contract log fetch");
    const result = await fetchContractLogs();
    logger.log("Completed scheduled contract log fetch:", result);
    return null;
  },
);

const updateActiveAds = async () => {
  try {
    const db = getFirestore();
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const cutoffTimeInSeconds = currentTimeInSeconds - thirtyDaysInSeconds;

    const contractLogsSnapshot = await db.collection("contract_logs").get();
    const batch = db.batch();
    let activeAdsCount = 0;

    const latestAdsByIpfsHash = new Map();

    contractLogsSnapshot.forEach((doc) => {
      const adData = doc.data();

      if (adData.expiryTime && adData.ipfsHash) {
        if (
          adData.expiryTime > currentTimeInSeconds &&
          adData.expiryTime >= cutoffTimeInSeconds
        ) {
          if (
            !latestAdsByIpfsHash.has(adData.ipfsHash) ||
            latestAdsByIpfsHash.get(adData.ipfsHash).expiryTime <
              adData.expiryTime
          ) {
            latestAdsByIpfsHash.set(adData.ipfsHash, {
              link: adData.link,
              description: adData.description,
              ipfsHash: adData.ipfsHash,
              expiryTime: adData.expiryTime,
              buyer: adData.buyer,
              transactionHash: adData.transactionHash,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    for (const [ipfsHash, adData] of latestAdsByIpfsHash.entries()) {
      const activeAdRef = db.collection("active_ads").doc(ipfsHash);
      batch.set(activeAdRef, adData);
      activeAdsCount++;
    }

    const activeAdsSnapshot = await db.collection("active_ads").get();
    let expiredAdsCount = 0;

    activeAdsSnapshot.forEach((doc) => {
      const adData = doc.data();

      if (adData.expiryTime < currentTimeInSeconds) {
        const expiredAdRef = db.collection("expired_active_ads").doc(doc.id);
        batch.set(expiredAdRef, {
          ...adData,
          expiredAt: new Date().toISOString(),
        });

        batch.delete(doc.ref);
        expiredAdsCount++;
      }
    });

    await batch.commit();

    logger.log(
      `Successfully updated active ads: ${activeAdsCount} active ads processed, ${expiredAdsCount} expired ads moved`,
    );
    return {
      success: true,
      activeAdsProcessed: activeAdsCount,
      expiredAdsMoved: expiredAdsCount,
      cutoffTime: new Date(cutoffTimeInSeconds * 1000).toISOString(),
    };
  } catch (error) {
    logger.error("Error updating active ads:", error);
    return { success: false, error: error.message };
  }
};

exports.scheduledUpdateActiveAds = onSchedule(
  {
    schedule: "every 12 hours",
    timeZone: "UTC",
  },
  async () => {
    logger.log("Starting scheduled active ads update");
    const result = await updateActiveAds();
    logger.log("Completed scheduled active ads update:", result);
    return null;
  },
);

exports.uploadImageToIPFS = onRequest(
  {
    cors,
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res
          .status(405)
          .json({ error: "Method not allowed. Please use POST." });
      }

      if (!req.body || !req.body.imageData) {
        return res.status(400).json({ error: "No image data provided." });
      }

      const imageData = req.body.imageData;
      const fileSizeInBytes = Buffer.byteLength(imageData, "base64");
      const maxSizeInBytes = 5 * 1024 * 1024;

      if (fileSizeInBytes > maxSizeInBytes) {
        return res
          .status(400)
          .json({ error: "File size exceeds the 5MB limit." });
      }

      const result = await pinata.upload.public.base64(imageData);

      logger.log("Successfully uploaded image to IPFS:", result);

      return res.status(200).json({
        success: true,
        cid: result.cid,
      });
    } catch (error) {
      logger.error("Error uploading image to IPFS:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to upload image to IPFS",
      });
    }
  },
);

exports.getAds = onRequest(
  {
    cors,
  },
  async (req, res) => {
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

      const userData = {
        timestamp: new Date().toISOString(),
        ip:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
        origin: req.headers.origin || req.headers.referer || "",
        host: req.headers.host || "",
        acceptLanguage: req.headers["accept-language"] || "",
        handle: req.body.handle,
      };

      const amountOfAds = req.body.amountOfAds || null;
      const getAllAds = req.body.getAllAds || false;

      logger.log("Amount of ads requested:", amountOfAds);
      logger.log("Get all ads flag:", getAllAds);

      const db = getFirestore();

      try {
        await db.collection("ad_requests").add(userData);
        logger.log("User data collected successfully");
      } catch (err) {
        logger.error("Error storing user data:", err);
      }

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
          ipfsHash: adData.ipfsHash,
          link: adData.link,
          description: adData.description,
          expiryTime: adData.expiryTime,
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
              logger.log("Converting IPFS hash to URL:", ad.ipfsHash);
              const result = await pinata.gateways.public.convert(ad.ipfsHash);
              logger.log("Conversion result:", JSON.stringify(result));
              return {
                url: result,
                link: ad.link,
                description: ad.description,
                expiryTime: ad.expiryTime,
                ipfsHash: ad.ipfsHash,
              };
            } catch (error) {
              logger.error(`Error converting IPFS hash ${ad.ipfsHash}:`, error);
              return ad;
            }
          }),
        );

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

        logger.log("Converting single ad IPFS hash to URL:", ad.ipfsHash);
        const result = await pinata.gateways.public.convert(ad.ipfsHash);
        logger.log("Conversion result for single ad:", JSON.stringify(result));

        const responseData = {
          success: true,
          result: {
            url: result,
            link: ad.link,
            description: ad.description,
            expiryTime: ad.expiryTime,
            ipfsHash: ad.ipfsHash,
          },
        };

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
  },
);
