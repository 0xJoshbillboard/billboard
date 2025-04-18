const { ethers } = require("ethers");
const logger = require("firebase-functions/logger");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const { PinataSDK } = require("pinata");
const contractABI = require("./abi");
const { setGlobalOptions } = require("firebase-functions");
const dotenv = require("dotenv");

dotenv.config();

setGlobalOptions({ region: "europe-west1" });
initializeApp();
const cors = [
  "*",
  /localhost(:\d+)?$/,
  "billboard-a6ede.web.app",
  "billboard-a6ede.firebaseapp.com",
];

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_API_KEY,
  pinataGateway: process.env.PINATA_GATEWAY,
});
const rpcUrl =
  "https://optimism-sepolia.infura.io/v3/da6fa5c1aa6546b882fee23987d3b294";
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  "0x6A655887aD8Bce1D0a19a1092905100744330120",
  contractABI,
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

    // Create a map to track the latest ad for each ipfsHash
    const latestAdsByIpfsHash = new Map();

    contractLogsSnapshot.forEach((doc) => {
      const adData = doc.data();

      // Only consider ads that have an expiryTime and ipfsHash
      if (adData.expiryTime && adData.ipfsHash) {
        // Check if the ad is still active (expiryTime > current time)
        if (
          adData.expiryTime > currentTimeInSeconds &&
          adData.expiryTime >= cutoffTimeInSeconds
        ) {
          // If we already have an ad with this ipfsHash, keep only the one with the latest expiryTime
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

    // Add all the latest active ads to the batch
    for (const [ipfsHash, adData] of latestAdsByIpfsHash.entries()) {
      const activeAdRef = db.collection("active_ads").doc(ipfsHash);
      batch.set(activeAdRef, adData);
      activeAdsCount++;
    }

    // Step 2: Process active_ads to move expired ads to expired_active_ads
    const activeAdsSnapshot = await db.collection("active_ads").get();
    let expiredAdsCount = 0;

    activeAdsSnapshot.forEach((doc) => {
      const adData = doc.data();

      // Check if the ad is expired
      if (adData.expiryTime < currentTimeInSeconds) {
        // Move to expired_active_ads collection
        const expiredAdRef = db.collection("expired_active_ads").doc(doc.id);
        batch.set(expiredAdRef, {
          ...adData,
          expiredAt: new Date().toISOString(),
        });

        // Delete from active_ads collection
        batch.delete(doc.ref);
        expiredAdsCount++;
      }
    });

    // Commit all the changes
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

// Function to upload image to IPFS
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

// Function to get image from IPFS
exports.getImageFromIPFS = onRequest(
  {
    cors,
  },
  async (req, res) => {
    try {
      // Check if the request method is POST
      if (req.method !== "POST") {
        return res
          .status(405)
          .json({ error: "Method not allowed. Please use GET." });
      }

      // Check if image data is provided
      if (!req.body || !req.body.cid) {
        return res.status(400).json({ error: "No cid data provided." });
      }

      const imageCid = req.body.cid;

      // Upload to IPFS via Pinata
      const result = await pinata.gateways.public.convert(imageCid);

      return res.status(200).json({
        success: true,
        result,
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
