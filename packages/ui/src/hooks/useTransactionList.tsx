import { useState, useEffect } from 'react';
import { BigNumberish } from 'ethers';

interface Transaction {
  hash: string;
  to: string;
  from: string;
  value: BigNumberish;
  data: string;
  nonce: number;
}

interface UseTransactionListProps {
  transactions: Transaction[];
  storageKey?: string;
}

interface UseTransactionListResult {
  executedTransactions: Transaction[];
  pendingTransactions: Transaction[];
  markAsExecuted: (transactionHash: string) => void;
  markAsPending: (transactionHash: string) => void;
  resetExecutionStatus: () => void;
}

const useTransactionList = ({
  transactions,
  storageKey = 'executedTransactions',
}: UseTransactionListProps): UseTransactionListResult => {
  const [executedTransactionHashes, setExecutedTransactionHashes] = useState<string[]>(() => {
    const savedData = localStorage.getItem(storageKey);
    return savedData ? JSON.parse(savedData) : [];
  });

  const executedTransactions = transactions.filter(tx => 
    executedTransactionHashes.includes(tx.hash)
  );
  
  const pendingTransactions = transactions.filter(tx => 
    !executedTransactionHashes.includes(tx.hash)
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(executedTransactionHashes));
  }, [executedTransactionHashes, storageKey]);

  const markAsExecuted = (transactionHash: string) => {
    setExecutedTransactionHashes(prev => {
      if (prev.includes(transactionHash)) return prev;
      return [...prev, transactionHash];
    });
  };

  const markAsPending = (transactionHash: string) => {
    setExecutedTransactionHashes(prev => 
      prev.filter(hash => hash !== transactionHash)
    );
  };

  const resetExecutionStatus = () => {
    setExecutedTransactionHashes([]);
  };

  return {
    executedTransactions,
    pendingTransactions,
    markAsExecuted,
    markAsPending,
    resetExecutionStatus,
  };
};

export default useTransactionList;

