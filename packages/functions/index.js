const { ethers } = require("ethers");
const logger = require("firebase-functions/logger");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const abi = require("./abi");
const governanceAbi = require("./abi-gov");
const { setGlobalOptions } = require("firebase-functions");
const dotenv = require("dotenv");
const sharp = require("sharp");
const axios = require("axios");

dotenv.config();

setGlobalOptions({ region: "europe-west1" });
initializeApp();

const cors = { cors: true };

const swarmyURL = `https://api.swarmy.cloud/api/data/bin?k=${process.env.SWARMY_KEY}`;
const swarmyURLWithReference = (reference) =>
  `https://api.swarmy.cloud/files/${reference}?k=${process.env.SWARMY_KEY}`;

const rpcUrl = `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API}`;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  "0xc5533b322861de8c894fc44ec421a02395b83df5",
  abi,
  provider,
);
const governanceContract = new ethers.Contract(
  "0x9527f41eb97173ea364b775b4ab99578110fec5f",
  governanceAbi,
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
        hash: log.args[4],
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

    const latestAdsByHash = new Map();

    contractLogsSnapshot.forEach((doc) => {
      const adData = doc.data();

      if (adData.expiryTime && adData.hash) {
        if (
          adData.expiryTime > currentTimeInSeconds &&
          adData.expiryTime >= cutoffTimeInSeconds
        ) {
          if (
            !latestAdsByHash.has(adData.hash) ||
            latestAdsByHash.get(adData.hash).expiryTime < adData.expiryTime
          ) {
            latestAdsByHash.set(adData.hash, {
              link: adData.link,
              description: adData.description,
              hash: adData.hash,
              expiryTime: adData.expiryTime,
              buyer: adData.buyer,
              transactionHash: adData.transactionHash,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    for (const [hash, adData] of latestAdsByHash.entries()) {
      const activeAdRef = db.collection("active_ads").doc(hash);
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

    const imageData = req.body.imageData;
    const fileSizeInBytes = Buffer.byteLength(imageData, "base64");
    const maxSizeInBytes = 1024 * 1024;

    if (fileSizeInBytes > maxSizeInBytes) {
      return res
        .status(400)
        .json({ error: "File size exceeds the 1MB limit." });
    }

    const imageBuffer = Buffer.from(imageData, "base64");

    const sanitizedImage = await sharp(imageBuffer)
      .resize(600, 400, {
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
      name: sanitizedBase64
        .slice(0, 20)
        .concat(Math.random().toString(36).substring(2, 15))
        .concat(".bin"),
      contentType: "application/octet-stream",
      base64: sanitizedBase64,
    });

    logger.log("Successfully uploaded sanitized image to hash:", result);

    return res.status(200).json({
      success: true,
      hash: result.data.swarmReference,
    });
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
            const response = await axios.get(swarmyURLWithReference(ad.hash));
            logger.log("Conversion result:", JSON.stringify(response));
            return {
              url: response,
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
      const response = await axios.get(swarmyURLWithReference(ad.hash));
      logger.log("Conversion result for single ad:", JSON.stringify(response));

      const responseData = {
        success: true,
        result: {
          url: response,
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
              url: response,
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

const fetchGovernanceEvents = async () => {
  try {
    const db = getFirestore();
    const currentBlock = await provider.getBlockNumber();

    const lastRunRef = db
      .collection("governance_events_metadata")
      .doc("last_run");
    const lastRunDoc = await lastRunRef.get();

    let lastProcessedBlock = currentBlock - 10000;

    if (lastRunDoc.exists) {
      lastProcessedBlock = lastRunDoc.data().lastProcessedBlock;
    }

    logger.log(
      `Fetching governance events from block ${lastProcessedBlock + 1} to ${currentBlock}`,
    );

    const fetchLogsInChunks = async (
      filter,
      startBlock,
      endBlock,
      chunkSize = 2000,
    ) => {
      let allLogs = [];
      let currentStartBlock = startBlock;

      while (currentStartBlock <= endBlock) {
        const currentEndBlock = Math.min(
          currentStartBlock + chunkSize - 1,
          endBlock,
        );

        try {
          logger.log(
            `Fetching logs from block ${currentStartBlock} to ${currentEndBlock}`,
          );
          const logs = await governanceContract.queryFilter(
            filter,
            currentStartBlock,
            currentEndBlock,
          );
          allLogs = [...allLogs, ...logs];
        } catch (error) {
          logger.error(
            `Error fetching logs from ${currentStartBlock} to ${currentEndBlock}:`,
            error,
          );
          if (error.message && error.message.includes("Too Many Requests")) {
            const newChunkSize = Math.floor(chunkSize / 2);
            if (newChunkSize < 100) {
              throw new Error(
                "Chunk size too small, cannot proceed with fetching logs",
              );
            }
            logger.log(`Reducing chunk size to ${newChunkSize} and retrying`);
            const remainingLogs = await fetchLogsInChunks(
              filter,
              currentStartBlock,
              endBlock,
              newChunkSize,
            );
            allLogs = [...allLogs, ...remainingLogs];
            break;
          } else {
            throw error;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        currentStartBlock = currentEndBlock + 1;
      }

      return allLogs;
    };

    const filterVotedForBlame = governanceContract.filters.VotedForBlame();
    const filterAdvertiserBlameResolved =
      governanceContract.filters.AdvertiserBlameResolved();

    const logsVotedForBlame = await fetchLogsInChunks(
      filterVotedForBlame,
      lastProcessedBlock + 1,
      currentBlock,
    );

    const logsAdvertiserBlameResolved = await fetchLogsInChunks(
      filterAdvertiserBlameResolved,
      lastProcessedBlock + 1,
      currentBlock,
    );

    const batch = db.batch();

    // Process VotedForBlame events
    for (const log of logsVotedForBlame) {
      const logData = {
        eventType: "VotedForBlame",
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: new Date().toISOString(),
        voter: log.args[0],
        advertiser: log.args[1],
        support: log.args[2],
        votes: log.args[3].toString(),
      };

      // Use a unique ID that includes the event type to avoid collisions
      const logRef = db
        .collection("governance_events")
        .doc(`${log.transactionHash}_VotedForBlame_${log.args[0]}`);
      batch.set(logRef, logData);

      logger.log(`Processing VotedForBlame event: ${JSON.stringify(logData)}`);
    }

    // Process AdvertiserBlameResolved events
    for (const log of logsAdvertiserBlameResolved) {
      const logData = {
        eventType: "AdvertiserBlameResolved",
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: new Date().toISOString(),
        from: log.args[0],
        resolved: log.args[1],
      };

      // Use a unique ID that includes the event type to avoid collisions
      const logRef = db
        .collection("governance_events")
        .doc(`${log.transactionHash}_AdvertiserBlameResolved`);
      batch.set(logRef, logData);

      logger.log(
        `Processing AdvertiserBlameResolved event: ${JSON.stringify(logData)}`,
      );
    }

    batch.set(lastRunRef, {
      lastProcessedBlock: currentBlock,
      lastRunTime: new Date().toISOString(),
    });

    await batch.commit();

    logger.log(
      `Processed governance events: ${logsVotedForBlame.length} VotedForBlame, ${logsAdvertiserBlameResolved.length} AdvertiserBlameResolved`,
    );

    return {
      success: true,
      processedEvents:
        logsVotedForBlame.length + logsAdvertiserBlameResolved.length,
      lastProcessedBlock: currentBlock,
    };
  } catch (error) {
    logger.error("Error fetching governance events:", error);
    throw error;
  }
};

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

    const cid = req.query.cid;
    const response = await axios.get(swarmyURLWithReference(cid));

    res.set("Content-Type", "application/octet-stream");
    res.send(response.data);
  } catch (error) {
    logger.error("Error fetching image from Swarmy:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch image from Swarmy",
    });
  }
});
