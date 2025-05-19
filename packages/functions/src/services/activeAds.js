const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

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

module.exports = {
  updateActiveAds,
};
