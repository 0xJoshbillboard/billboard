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
  securityDepositAdvertiser: number;
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
  blameAdvertiser: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  approveBBT: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  voteForBlame: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  resolveAdvertiserBlame: {
    pending: boolean;
    completed: boolean;
    error: string | null;
    label: string;
  };
  returnSecurityDepositForBlame: {
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
  hash: string;
}

export interface GovernanceEvent {
  advertiser: string;
  blockNumber: number;
  eventType: string;
  support: boolean;
  timestamp: string;
  timestampDate: Date;
  transactionHash: string;
  voter: string;
  votes: string;
}

export interface BillboardStatistic {
  acceptLanguage?: string;
  buyer: string[];
  description?: string;
  expiryTime?: number;
  handle?: string;
  host?: string;
  link?: string;
  origin?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
  ads?: Array<{
    buyer: string;
    description: string;
    expiryTime: number;
    hash: string;
    link: string;
  }>;
}
