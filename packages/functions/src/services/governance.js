const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { governanceContract, provider } = require("../contracts");

const fetchGovernanceEvents = async () => {
  try {
    const db = getFirestore();
    const currentBlock = await provider.getBlockNumber();

    const lastRunRef = db
      .collection("governance_events_metadata")
      .doc("last_run");
    const lastRunDoc = await lastRunRef.get();

    let lastProcessedBlock = currentBlock - 100_000;

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

module.exports = {
  fetchGovernanceEvents,
};
