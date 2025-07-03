const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { contract, provider } = require("../contracts");

const fetchContractLogs = async () => {
  try {
    const db = getFirestore();
    const currentBlock = await provider.getBlockNumber();

    const lastRunRef = db.collection("contract_logs_metadata").doc("last_run");
    const lastRunDoc = await lastRunRef.get();

    let lastProcessedBlock = currentBlock - 100_000;

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
        vertical: log.args[5],
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

module.exports = {
  fetchContractLogs,
};
