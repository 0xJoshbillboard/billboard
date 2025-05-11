export interface Proposal {
  id: number;
  duration: number;
  pricePerBillboard: number;
  securityDeposit: number;
  initialSecurityDeposit: number;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  minProposalTokens: number;
  minVotingTokens: number;
  createdAt: number;
  securityDepositProvider: number;
}

export interface TransactionStatus {
  approveUSDC: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  buyBillboard: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  extendBillboard: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  registerProvider: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  approveTokens: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  buyTokens: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  createProposal: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  vote: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  executeProposal: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
}

export interface RawBillboard {
  owner: string;
  expiryTime: number;
  description: string;
  link: string;
  ipfsHash: string;
}
