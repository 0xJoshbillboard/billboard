import { useConnectWallet } from "@web3-onboard/react";
import { BillboardSDK } from "billboard-sdk";
import {
  BigNumberish,
  BrowserProvider,
  Contract,
  getBigInt,
  JsonRpcProvider,
} from "ethers";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { chains, defaultProvider } from "../utils/chains";
import {
  BILLBOARD_ADDRESS,
  BILLBOARD_TOKEN_ABI,
  BILLBOARD_TOKEN_ADDRESS,
  CONTRACT_ABI,
  GOVERNANCE_ABI,
  GOVERNANCE_ADDRESS,
  USDC_ADDRESS,
  USDC_MOCK_ABI,
} from "../utils/contracts";
import {
  BillboardStatistic,
  Proposal,
  RawBillboard,
  TransactionStatus,
} from "../utils/types";

const billboardSDK = new BillboardSDK();
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function useBillboard() {
  // State variables
  const [{ wallet }] = useConnectWallet();
  const [contract, setContract] = useState<Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<Contract | null>(null);
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [governanceSettings, setGovernanceSettings] = useState<{
    price: number;
    duration: number;
    minProposalTokens: number;
    minVotingTokens: number;
    securityDeposit: number;
    securityDepositAdvertiser: number;
  }>({
    price: 0,
    duration: 0,
    minProposalTokens: 0,
    minVotingTokens: 0,
    securityDeposit: 0,
    securityDepositAdvertiser: 0,
  });
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    {
      approveUSDC: {
        pending: false,
        completed: false,
        error: null,
        label: "Approve USDC",
      },
      buyBillboard: {
        pending: false,
        completed: false,
        error: null,
        label: "Buy Billboard",
      },
      extendBillboard: {
        pending: false,
        completed: false,
        error: null,
        label: "Extend Billboard",
      },
      registerProvider: {
        pending: false,
        completed: false,
        error: null,
        label: "Register Provider",
      },
      approveTokens: {
        pending: false,
        completed: false,
        error: null,
        label: "Approve Tokens",
      },
      buyTokens: {
        pending: false,
        completed: false,
        error: null,
        label: "Buy Tokens",
      },
      createProposal: {
        pending: false,
        completed: false,
        error: null,
        label: "Create Proposal",
      },
      vote: {
        pending: false,
        completed: false,
        error: null,
        label: "Vote on Proposal",
      },
      executeProposal: {
        pending: false,
        completed: false,
        error: null,
        label: "Execute Proposal",
      },
      blameAdvertiser: {
        pending: false,
        completed: false,
        error: null,
        label: "Blame Advertiser",
      },
      approveBBT: {
        pending: false,
        completed: false,
        error: null,
        label: "Approve BBT",
      },
      voteForBlame: {
        pending: false,
        completed: false,
        error: null,
        label: "Vote for Blame",
      },
      resolveAdvertiserBlame: {
        pending: false,
        completed: false,
        error: null,
        label: "Resolve Advertiser Blame",
      },
      returnSecurityDepositForBlame: {
        pending: false,
        completed: false,
        error: null,
        label: "Return Security Deposit for Blame",
      },
    },
  );

  // Initialize contracts
  useEffect(() => {
    const setContracts = async () => {
      if (wallet?.provider) {
        const chainId = wallet.chains[0].id;
        const supportedChain = chains.find((chain) => chain.id === chainId);

        if (supportedChain) {
          const provider = new BrowserProvider(wallet.provider);
          const signer = await provider.getSigner();
          const govContract = new Contract(
            GOVERNANCE_ADDRESS,
            GOVERNANCE_ABI,
            signer,
          );
          setContract(new Contract(BILLBOARD_ADDRESS, CONTRACT_ABI, signer));
          setUsdcContract(new Contract(USDC_ADDRESS, USDC_MOCK_ABI, signer));
          setGovernanceContract(govContract);
          setTokenContract(
            new Contract(BILLBOARD_TOKEN_ADDRESS, BILLBOARD_TOKEN_ABI, signer),
          );
        } else {
          const provider = new JsonRpcProvider(defaultProvider);
          const govContract = new Contract(
            GOVERNANCE_ADDRESS,
            GOVERNANCE_ABI,
            provider,
          );
          setContract(new Contract(BILLBOARD_ADDRESS, CONTRACT_ABI, provider));
          setUsdcContract(new Contract(USDC_ADDRESS, USDC_MOCK_ABI, provider));
          setGovernanceContract(govContract);
          setTokenContract(
            new Contract(
              BILLBOARD_TOKEN_ADDRESS,
              BILLBOARD_TOKEN_ABI,
              provider,
            ),
          );
        }
      } else {
        const provider = new JsonRpcProvider(defaultProvider);
        const govContract = new Contract(
          GOVERNANCE_ADDRESS,
          GOVERNANCE_ABI,
          provider,
        );
        setContract(new Contract(BILLBOARD_ADDRESS, CONTRACT_ABI, provider));
        setUsdcContract(new Contract(USDC_ADDRESS, USDC_MOCK_ABI, provider));
        setGovernanceContract(govContract);
        setTokenContract(
          new Contract(BILLBOARD_TOKEN_ADDRESS, BILLBOARD_TOKEN_ABI, provider),
        );
      }
    };

    setContracts();
  }, [wallet]);

  // Load governance settings
  useEffect(() => {
    const getGovSettings = async () => {
      if (governanceContract) {
        const [
          price,
          duration,
          minProposalTokens,
          minVotingTokens,
          securityDeposit,
          securityDepositAdvertiser,
        ] = await Promise.all([
          governanceContract.pricePerBillboard(),
          governanceContract.duration(),
          governanceContract.minProposalTokens(),
          governanceContract.minVotingTokens(),
          governanceContract.securityDeposit(),
          governanceContract.securityDepositAdvertiser(),
        ]);

        const readablePrice = Number(price) / 1_000_000;
        const durationInSeconds = Number(duration);
        const minProposalTokensReadable = Number(minProposalTokens) / 1e18;
        const minVotingTokensReadable = Number(minVotingTokens) / 1e18;
        const securityDepositReadable = Number(securityDeposit) / 1e6;
        const securityDepositAdvertiserReadable =
          Number(securityDepositAdvertiser) / 1e6;
        setGovernanceSettings({
          price: readablePrice,
          duration: durationInSeconds,
          minProposalTokens: minProposalTokensReadable,
          minVotingTokens: minVotingTokensReadable,
          securityDeposit: securityDepositReadable,
          securityDepositAdvertiser: securityDepositAdvertiserReadable,
        });
      }
    };
    getGovSettings();
  }, [governanceContract]);

  // Load USDC balance
  useEffect(() => {
    if (wallet && usdcContract) {
      fetchUsdcBalance().then((balance) => {
        setUsdcBalance(balance);
      });
    }
  }, [wallet, usdcContract]);

  // Load token balance
  useEffect(() => {
    if (wallet && tokenContract) {
      fetchTokenBalance().then((balance) => {
        setTokenBalance(balance);
      });
    }
  }, [wallet, tokenContract]);

  // Load proposals and voting status
  useEffect(() => {
    if (governanceContract) {
      fetchProposals();
      fetchVotingStatus();
    }
  }, [governanceContract]);

  // Token functions
  const fetchTokenBalance = async () => {
    if (!tokenContract || !wallet?.accounts[0].address) {
      return "0";
    }
    const balance = await tokenContract.balanceOf(wallet.accounts[0].address);
    return (Number(balance) / 1e18).toLocaleString();
  };

  const approveBBT = async (amount: number) => {
    if (!tokenContract || !wallet?.accounts[0].address) {
      throw new Error("Token contract or wallet not defined");
    }

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveBBT: {
          ...prev.approveBBT,
          pending: true,
          error: null,
        },
      }));

      const currentAllowance = await tokenContract.allowance(
        wallet.accounts[0].address,
        GOVERNANCE_ADDRESS,
      );

      const parsedAmount = BigInt(amount) * BigInt(1e18);

      if (BigInt(currentAllowance) < parsedAmount) {
        const approveTx = await tokenContract.approve(
          GOVERNANCE_ADDRESS,
          parsedAmount,
        );
        await approveTx.wait();
        setTransactionStatus((prev) => ({
          ...prev,
          approveBBT: {
            ...prev.approveBBT,
            pending: false,
            completed: true,
          },
        }));
      } else {
        setTransactionStatus((prev) => ({
          ...prev,
          approveBBT: {
            ...prev.approveBBT,
            pending: false,
            completed: true,
          },
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTransactionStatus((prev) => ({
        ...prev,
        approveBBT: {
          ...prev.approveBBT,
          pending: false,
          error: errorMessage,
        },
      }));
      throw error;
    }
  };

  const buyBBT = async (amount: number) => {
    if (!tokenContract || !wallet?.accounts[0].address) {
      throw new Error("Token contract or wallet not defined");
    }

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveTokens: { ...prev.approveTokens, pending: true, error: null },
      }));

      const currentAllowance = await usdcContract.allowance(
        wallet.accounts[0].address,
        tokenContract.target,
      );
      if (BigInt(currentAllowance) < BigInt(amount)) {
        const approveTx = await usdcContract.approve(
          tokenContract.target,
          amount,
        );
        await approveTx.wait();
      }

      setTransactionStatus((prev) => ({
        ...prev,
        approveTokens: {
          ...prev.approveTokens,
          pending: false,
          completed: true,
        },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        buyTokens: { ...prev.buyTokens, pending: true, error: null },
      }));

      const tx = await tokenContract.buyTokens(amount);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        buyTokens: { ...prev.buyTokens, pending: false, completed: true },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.approveTokens.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          approveTokens: {
            ...prev.approveTokens,
            pending: false,
            error: errorMessage,
          },
        }));
      } else {
        setTransactionStatus((prev) => ({
          ...prev,
          buyTokens: { ...prev.buyTokens, pending: false, error: errorMessage },
        }));
      }
      throw error;
    }
  };

  // USDC functions
  const fetchUsdcBalance = async () => {
    if (!usdcContract || !wallet?.accounts[0].address) {
      return "0";
    }
    const balance = await usdcContract.balanceOf(wallet?.accounts[0].address);
    return (Number(balance) / 1_000_000).toLocaleString() + "";
  };

  const approveUSDC = async (amount: string) => {
    if (!usdcContract || !contract) {
      throw new Error("USDC not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: true, error: null },
      }));

      const tx = await usdcContract.approve(BILLBOARD_ADDRESS, amount);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: false, completed: true },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: {
          ...prev.approveUSDC,
          pending: false,
          error: errorMessage,
        },
      }));
      throw error;
    }
  };

  const allowanceUSDC = async () => {
    if (!usdcContract || !wallet?.accounts[0].address) {
      console.error("USDC not defined");
      return 0 as BigNumberish;
    }
    return (await usdcContract.allowance(
      wallet.accounts[0].address,
      BILLBOARD_ADDRESS,
    )) as BigNumberish;
  };

  // Governance functions
  const fetchProposals = async () => {
    if (!governanceContract) return;

    try {
      const proposalCount = await governanceContract.proposalCount();
      const fetchedProposals: Proposal[] = [];

      for (let i = 0; i < proposalCount; i++) {
        const proposal = await governanceContract.getProposal(i);
        fetchedProposals.push({
          id: i,
          duration: Number(proposal[0]),
          pricePerBillboard: Number(proposal[1]),
          securityDeposit: Number(proposal[2]),
          initialSecurityDeposit: Number(proposal[3]),
          minProposalTokens: Number(proposal[4]),
          minVotingTokens: Number(proposal[5]),
          votesFor: Number(proposal[6]),
          votesAgainst: Number(proposal[7]),
          executed: proposal[8],
          createdAt: Number(proposal[9]),
          securityDepositAdvertiser: Number(proposal[10]),
        });
      }

      setProposals(fetchedProposals);
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
    }
  };

  const fetchVotingStatus = async () => {
    if (!governanceContract || !wallet?.accounts[0].address) return;

    try {
      const proposalCount = await governanceContract.proposals.length;
      const votingStatus: Record<number, boolean> = {};

      for (let i = 0; i < proposalCount; i++) {
        const hasVotedResult = await governanceContract.hasVoted(
          wallet.accounts[0].address,
          i,
        );
        votingStatus[i] = hasVotedResult;
      }

      setHasVoted(votingStatus);
    } catch (error) {
      console.error("Failed to fetch voting status:", error);
    }
  };

  const createProposal = async (
    duration: bigint,
    pricePerBillboard: bigint,
    securityDeposit: bigint,
    minProposalTokens: bigint,
    minVotingTokens: bigint,
    securityDepositProvider: bigint,
  ) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!tokenContract) throw new Error("Token contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveTokens: { ...prev.approveTokens, pending: true, error: null },
      }));

      const minProposalTokensRequired =
        await governanceContract.minProposalTokens();
      const currentAllowance = await tokenContract.allowance(
        wallet.accounts[0].address,
        GOVERNANCE_ADDRESS,
      );

      if (BigInt(currentAllowance) < BigInt(minProposalTokensRequired)) {
        const approveTx = await tokenContract.approve(
          GOVERNANCE_ADDRESS,
          minProposalTokensRequired,
        );
        await approveTx.wait();
      }

      setTransactionStatus((prev) => ({
        ...prev,
        approveTokens: {
          ...prev.approveTokens,
          pending: false,
          completed: true,
        },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        createProposal: { ...prev.createProposal, pending: true, error: null },
      }));

      const tx = await governanceContract.createProposal(
        duration,
        pricePerBillboard,
        securityDeposit,
        minProposalTokens,
        minVotingTokens,
        securityDepositProvider,
      );
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        createProposal: {
          ...prev.createProposal,
          pending: false,
          completed: true,
        },
      }));

      await fetchProposals();
      return tx;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.approveTokens.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          approveTokens: {
            ...prev.approveTokens,
            pending: false,
            error: errorMessage,
          },
        }));
      } else {
        setTransactionStatus((prev) => ({
          ...prev,
          createProposal: {
            ...prev.createProposal,
            pending: false,
            error: errorMessage,
          },
        }));
      }
      console.error("Failed to create proposal:", error);
      throw error;
    }
  };

  const vote = async (proposalId: number, support: boolean) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        vote: { ...prev.vote, pending: true, error: null },
      }));

      const tx = await governanceContract.vote(proposalId, support);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        vote: { ...prev.vote, pending: false, completed: true },
      }));

      await fetchProposals();
      await fetchVotingStatus();
      return tx;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTransactionStatus((prev) => ({
        ...prev,
        vote: { ...prev.vote, pending: false, error: errorMessage },
      }));
      console.error("Failed to vote:", error);
      throw error;
    }
  };

  const executeProposal = async (proposalId: number) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        executeProposal: {
          ...prev.executeProposal,
          pending: true,
          error: null,
        },
      }));

      const tx = await governanceContract.executeProposal(proposalId);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        executeProposal: {
          ...prev.executeProposal,
          pending: false,
          completed: true,
        },
      }));

      await fetchProposals();
      const [
        price,
        duration,
        minProposalTokens,
        minVotingTokens,
        securityDeposit,
        securityDepositAdvertiser,
      ] = await Promise.all([
        governanceContract.pricePerBillboard(),
        governanceContract.duration(),
        governanceContract.votingPeriod(),
        governanceContract.minProposalTokens(),
        governanceContract.minVotingTokens(),
        governanceContract.securityDeposit(),
        governanceContract.securityDepositAdvertiser(),
      ]);

      setGovernanceSettings({
        price: Number(price) / 1_000_000,
        duration: Number(duration),
        minProposalTokens: Number(minProposalTokens),
        minVotingTokens: Number(minVotingTokens),
        securityDeposit: Number(securityDeposit) / 1e6,
        securityDepositAdvertiser: Number(securityDepositAdvertiser) / 1e6,
      });
      return tx;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTransactionStatus((prev) => ({
        ...prev,
        executeProposal: {
          ...prev.executeProposal,
          pending: false,
          error: errorMessage,
        },
      }));
      console.error("Failed to execute proposal:", error);
      throw error;
    }
  };

  // Billboard functions
  const buy = async (
    description: string,
    link: string,
    file: File | null,
    cid?: string,
  ) => {
    if (!contract) {
      throw new Error("Contract not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: true, error: null },
      }));

      const allowance = await allowanceUSDC();
      if (getBigInt(allowance) < getBigInt(governanceSettings.price * 1e6)) {
        await approveUSDC((governanceSettings.price * 1e6).toString());
      }

      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: false, completed: true },
      }));

      let url;
      if (file) {
        url = await uploadImage(file);
      } else if (cid) {
        url = { cid };
      } else {
        throw new Error("No file or CID provided");
      }
      if (!url?.cid) {
        throw new Error(`url not defined: ${url}`);
      }

      setTransactionStatus((prev) => ({
        ...prev,
        buyBillboard: { ...prev.buyBillboard, pending: true, error: null },
      }));

      const tx = await contract.purchaseBillboard(description, link, url.cid);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        buyBillboard: { ...prev.buyBillboard, pending: false, completed: true },
      }));

      return { cid: url.cid, tx };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.approveUSDC.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          approveUSDC: {
            ...prev.approveUSDC,
            pending: false,
            error: errorMessage,
          },
        }));
      } else {
        setTransactionStatus((prev) => ({
          ...prev,
          buyBillboard: {
            ...prev.buyBillboard,
            pending: false,
            error: errorMessage,
          },
        }));
      }
      console.error(error);
      throw new Error("Failed to purchase billboard");
    }
  };

  const extend = async (index: number) => {
    if (!contract || !governanceContract) {
      throw new Error("Contract not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: true, error: null },
      }));

      const allowance = await allowanceUSDC();
      const governancePrice = await governanceContract.pricePerBillboard();

      if (getBigInt(allowance) < getBigInt(governancePrice)) {
        await approveUSDC(governancePrice.toString());
      }

      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: false, completed: true },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        extendBillboard: {
          ...prev.extendBillboard,
          pending: true,
          error: null,
        },
      }));

      const tx = await contract.extendBillboard(index);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        extendBillboard: {
          ...prev.extendBillboard,
          pending: false,
          completed: true,
        },
      }));

      return tx;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.approveUSDC.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          approveUSDC: {
            ...prev.approveUSDC,
            pending: false,
            error: errorMessage,
          },
        }));
      } else {
        setTransactionStatus((prev) => ({
          ...prev,
          extendBillboard: {
            ...prev.extendBillboard,
            pending: false,
            error: errorMessage,
          },
        }));
      }
      throw error;
    }
  };

  const fetchBillboards = async () => {
    if (!contract && !wallet) {
      throw new Error("Contract or wallet not defined");
    }
    const billboards = await contract.getBillboards(
      wallet?.accounts[0].address,
    );
    return billboards.map((billboard: any) => ({
      owner: billboard.owner,
      expiryTime: Number(billboard.expiryTime),
      description: billboard.description,
      link: billboard.link,
      ipfsHash: billboard.ipfsHash,
    })) as RawBillboard[];
  };

  const registerProvider = async (handle: string) => {
    if (!contract || !governanceContract) {
      throw new Error("Contract not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: true, error: null },
      }));

      const allowance = await allowanceUSDC();
      const securityDepositAdvertiser =
        governanceSettings.securityDepositAdvertiser;
      if (getBigInt(allowance) < getBigInt(securityDepositAdvertiser * 1e6)) {
        await approveUSDC((securityDepositAdvertiser * 1e6).toString());
      }

      setTransactionStatus((prev) => ({
        ...prev,
        approveUSDC: { ...prev.approveUSDC, pending: false, completed: true },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        registerProvider: {
          ...prev.registerProvider,
          pending: true,
          error: null,
        },
      }));

      const tx = await contract.registerBillboardAdvertiser(handle);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        registerProvider: {
          ...prev.registerProvider,
          pending: false,
          completed: true,
        },
      }));

      return tx;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.approveUSDC.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          approveUSDC: {
            ...prev.approveUSDC,
            pending: false,
            error: errorMessage,
          },
        }));
      } else {
        setTransactionStatus((prev) => ({
          ...prev,
          registerProvider: {
            ...prev.registerProvider,
            pending: false,
            error: errorMessage,
          },
        }));
      }
      console.error("Failed to register provider:", error);
      throw error;
    }
  };

  const blameAdvertiser = async (address: string) => {
    if (!contract || !governanceContract) {
      throw new Error("Contract not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");
    setTransactionStatus((prev) => ({
      ...prev,
      blameAdvertiser: { ...prev.blameAdvertiser, pending: true, error: null },
    }));
    try {
      const tx = await governanceContract.blameAdvertiser(address);
      await tx.wait();
      setTransactionStatus((prev) => ({
        ...prev,
        blameAdvertiser: {
          ...prev.blameAdvertiser,
          pending: false,
          completed: true,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTransactionStatus((prev) => ({
        ...prev,
        blameAdvertiser: {
          ...prev.blameAdvertiser,
          pending: false,
          error: errorMessage,
        },
      }));
      throw error;
    }
  };

  const voteForBlame = async (address: string, support: boolean) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");
    setTransactionStatus((prev) => ({
      ...prev,
      voteForBlame: { ...prev.voteForBlame, pending: true, error: null },
    }));
    try {
      const tx = await governanceContract.voteForBlame(address, support);
      await tx.wait();
      setTransactionStatus((prev) => ({
        ...prev,
        voteForBlame: { ...prev.voteForBlame, pending: false, completed: true },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTransactionStatus((prev) => ({
        ...prev,
        voteForBlame: {
          ...prev.voteForBlame,
          pending: false,
          error: errorMessage,
        },
      }));
      throw error;
    }
  };

  const getAdvertiserIsBlamed = async (address: string) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");
    return await governanceContract.getAdvertiserIsBlamed(address);
  };

  const resolveAdvertiserBlame = async (address: string) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");
    governanceContract.resolveAdvertiserBlame(address);
  };

  const returnSecurityDepositForBlame = async (address: string) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");
    return await governanceContract.returnSecurityDepositForBlame(address);
  };

  const getAdvertiser = async (address: string) => {
    if (!contract) throw new Error("Contract not defined");
    return await contract.getBillboardAdvertiser(address);
  };

  const getAds = async () => {
    return billboardSDK.getAds("billboard-ui");
  };

  const uploadImage = async (image: File) => {
    if (image.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds the maximum limit of 5MB");
    }
    try {
      const arrayBuffer = await image.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const binary = bytes.reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        "",
      );
      const imageBase64 = btoa(binary);

      const response = await fetch(
        "https://uploadimagetoipfs-pe2o27xb6q-ew.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageData: imageBase64 }),
        },
      );
      const data = await response.json();
      return data as { success: boolean; cid: string };
    } catch (error) {
      console.error(error);
      throw new Error(`Error while uploading image: ${error}`);
    }
  };

  const getStatistics = async (buyer: string[]) => {
    if (!buyer || buyer.length === 0) {
      return [];
    }

    try {
      const snapshot = await getDocs(
        query(
          collection(db, "ad_requests"),
          where("buyer", "array-contains-any", buyer),
        ),
      );
      return snapshot.docs.map((doc) => doc.data() as BillboardStatistic);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return [];
    }
  };

  return {
    // Billboard operations
    buy,
    extend,
    fetchBillboards,
    uploadImage,
    getAds,
    registerProvider,
    getAdvertiser,
    blameAdvertiser,
    voteForBlame,
    getAdvertiserIsBlamed,
    resolveAdvertiserBlame,
    returnSecurityDepositForBlame,
    getStatistics,

    // USDC operations
    approveUSDC,
    allowanceUSDC,
    usdcBalance,

    // Token operations
    tokenBalance,
    buyBBT,
    approveBBT,

    // Governance operations
    governanceSettings,
    proposals,
    hasVoted,
    createProposal,
    vote,
    executeProposal,
    fetchProposals,
    fetchVotingStatus,

    // Transaction status tracking
    transactionStatus,

    // Contract
    contract,
    usdcContract,
    tokenContract,
    governanceContract,
  };
}
