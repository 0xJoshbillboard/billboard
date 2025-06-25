import { useConnectWallet } from "@web3-onboard/react";
import { BillboardSDK } from "billboard-sdk";
import {
  BigNumberish,
  BrowserProvider,
  Contract,
  getBigInt,
  JsonRpcProvider,
  Signer,
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
  getMulticall3Contract,
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
import useERC20Permit from "./useERC20Permit";

const billboardSDK = new BillboardSDK();
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function useBillboard() {
  const { getPermit } = useERC20Permit();
  const [{ wallet }] = useConnectWallet();
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<Contract | null>(null);
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [governanceSettings, setGovernanceSettings] = useState<{
    price: number;
    duration: number;
    minVotingTokens: number;
    securityDepositForProposal: number;
    securityDepositAdvertiser: number;
  }>({
    price: 0,
    duration: 0,
    minVotingTokens: 0,
    securityDepositForProposal: 0,
    securityDepositAdvertiser: 0,
  });
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    {
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
      permitToken: {
        pending: false,
        completed: false,
        error: null,
        label: "Permit Token",
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
          setSigner(signer);
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
      try {
        if (governanceContract) {
          const [
            price,
            duration,
            minVotingTokens,
            securityDepositForProposal,
            securityDepositAdvertiser,
          ] = await Promise.all([
            governanceContract.pricePerBillboard(),
            governanceContract.duration(),
            governanceContract.minVotingTokens(),
            governanceContract.securityDepositForProposal(),
            governanceContract.securityDepositAdvertiser(),
          ]);

          const readablePrice = Number(price) / 1_000_000;
          const durationInSeconds = Number(duration);
          const minVotingTokensReadable = Number(minVotingTokens) / 1e18;
          const securityDepositReadable = Number(
            securityDepositForProposal / BigInt(1e18),
          );
          const securityDepositAdvertiserReadable =
            Number(securityDepositAdvertiser) / 1e6;
          setGovernanceSettings({
            price: readablePrice,
            duration: durationInSeconds,
            minVotingTokens: minVotingTokensReadable,
            securityDepositForProposal: securityDepositReadable,
            securityDepositAdvertiser: securityDepositAdvertiserReadable,
          });
        }
      } catch (error) {
        console.error("Failed to get governance settings:", error);
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
  const buyBBT = async (amount: number) => {
    if (!tokenContract || !wallet?.accounts[0].address) {
      throw new Error("Token contract or wallet not defined");
    }

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: { ...prev.permitToken, pending: true, error: null },
      }));

      const currentAllowance = await usdcContract.allowance(
        wallet.accounts[0].address,
        tokenContract.target,
      );
      let permitFromToken: Awaited<ReturnType<typeof getPermit>> | null = null;
      if (BigInt(currentAllowance) < BigInt(amount)) {
        permitFromToken = await getPermit(
          usdcContract,
          wallet.accounts[0].address,
          BILLBOARD_TOKEN_ADDRESS,
          amount.toString(),
        );
      }

      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: {
          ...prev.permitToken,
          pending: false,
          completed: true,
        },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        buyTokens: { ...prev.buyTokens, pending: true, error: null },
      }));

      const calls = permitFromToken
        ? [
            {
              target: tokenContract.target,
              data: permitFromToken?.encodedPermit,
            },
            {
              target: tokenContract.target,
              data: tokenContract.interface.encodeFunctionData("buyTokens", [
                amount,
              ]),
            },
          ]
        : [
            {
              target: tokenContract.target,
              data: tokenContract.interface.encodeFunctionData("buyTokens", [
                amount,
              ]),
            },
          ];

      const tx = await getMulticall3Contract(signer).aggregate(calls);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        buyTokens: { ...prev.buyTokens, pending: false, completed: true },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.buyTokens.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          buyTokens: {
            ...prev.buyTokens,
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
          minVotingTokens: Number(proposal[4]),
          votesFor: Number(proposal[5]),
          votesAgainst: Number(proposal[6]),
          executed: proposal[7],
          createdAt: Number(proposal[8]),
          securityDepositAdvertiser: Number(proposal[9]),
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
    minVotingTokens: bigint,
    securityDepositProvider: bigint,
  ) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!tokenContract) throw new Error("Token contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: { ...prev.permitToken, pending: true, error: null },
      }));

      const currentAllowance = await tokenContract.allowance(
        wallet.accounts[0].address,
        GOVERNANCE_ADDRESS,
      );

      let permitFromToken: Awaited<ReturnType<typeof getPermit>> | null = null;
      if (
        BigInt(currentAllowance) <
        BigInt(governanceSettings.securityDepositForProposal)
      ) {
        permitFromToken = await getPermit(
          usdcContract,
          wallet.accounts[0].address,
          GOVERNANCE_ADDRESS,
          governanceSettings.securityDepositForProposal.toString(),
        );
      }

      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: {
          ...prev.permitToken,
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
        minVotingTokens,
        securityDepositProvider,
        permitFromToken?.deadline,
        permitFromToken?.v,
        permitFromToken?.r,
        permitFromToken?.s,
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
      if (transactionStatus.permitToken.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          approveTokens: {
            ...prev.permitToken,
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
        minVotingTokens,
        securityDepositForProposal,
        securityDepositAdvertiser,
      ] = await Promise.all([
        governanceContract.pricePerBillboard(),
        governanceContract.duration(),
        governanceContract.votingPeriod(),
        governanceContract.minVotingTokens(),
        governanceContract.securityDepositForProposal(),
        governanceContract.securityDepositAdvertiser(),
      ]);

      setGovernanceSettings({
        price: Number(price) / 1_000_000,
        duration: Number(duration),
        minVotingTokens: Number(minVotingTokens),
        securityDepositForProposal: Number(securityDepositForProposal) / 1e18,
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
  const buy = async (description: string, link: string, file: File | null) => {
    if (!contract) {
      throw new Error("Contract not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");

    try {
      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: { ...prev.permitToken, pending: true, error: null },
      }));

      const allowance = await allowanceUSDC();
      let permitFromToken: Awaited<ReturnType<typeof getPermit>> | null = null;
      if (getBigInt(allowance) < getBigInt(governanceSettings.price * 1e6)) {
        permitFromToken = await getPermit(
          usdcContract,
          wallet.accounts[0].address,
          BILLBOARD_ADDRESS,
          (governanceSettings.price * 1e6).toString(),
        );
      }

      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: {
          ...prev.permitToken,
          pending: false,
          completed: true,
        },
      }));

      let url;
      if (file) {
        url = await uploadImage(file);
      } else {
        throw new Error("No file or CID provided");
      }
      if (!url?.hash) {
        throw new Error(`url not defined: ${url}`);
      }

      setTransactionStatus((prev) => ({
        ...prev,
        buyBillboard: { ...prev.buyBillboard, pending: true, error: null },
      }));

      const tx = permitFromToken
        ? getMulticall3Contract(signer).aggregate([
            {
              target: contract.target,
              data: contract.interface.encodeFunctionData("purchaseBillboard", [
                description,
                link,
                url.hash,
                permitFromToken.deadline,
                permitFromToken.v,
                permitFromToken.r,
                permitFromToken.s,
              ]),
            },
          ])
        : await contract.purchaseBillboard(description, link, url.hash);
      await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        buyBillboard: { ...prev.buyBillboard, pending: false, completed: true },
      }));

      return { hash: url.hash, tx };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (transactionStatus.permitToken.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          permitToken: {
            ...prev.permitToken,
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
        permitToken: { ...prev.permitToken, pending: true, error: null },
      }));

      const allowance = await allowanceUSDC();

      let permitFromToken: Awaited<ReturnType<typeof getPermit>> | null = null;
      if (getBigInt(allowance) < getBigInt(governanceSettings.price * 1e6)) {
        permitFromToken = await getPermit(
          usdcContract,
          wallet.accounts[0].address,
          BILLBOARD_ADDRESS,
          (governanceSettings.price * 1e6).toString(),
        );
      }

      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: {
          ...prev.permitToken,
          pending: false,
          completed: true,
        },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        extendBillboard: {
          ...prev.extendBillboard,
          pending: true,
          error: null,
        },
      }));

      const tx = permitFromToken
        ? getMulticall3Contract(signer).aggregate([
            {
              target: USDC_ADDRESS,
              data: permitFromToken?.encodedPermit,
            },
            {
              target: contract.target,
              data: contract.interface.encodeFunctionData("extendBillboard", [
                index,
              ]),
            },
          ])
        : await contract.extendBillboard(index);
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
      if (transactionStatus.permitToken.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          permitToken: {
            ...prev.permitToken,
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
      hash: billboard.hash,
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
        permitToken: { ...prev.permitToken, pending: true, error: null },
      }));

      const allowance = await allowanceUSDC();
      const securityDepositAdvertiser =
        governanceSettings.securityDepositAdvertiser;
      let permitFromToken: Awaited<ReturnType<typeof getPermit>> | null = null;
      if (getBigInt(allowance) < getBigInt(securityDepositAdvertiser * 1e6)) {
        permitFromToken = await getPermit(
          usdcContract,
          wallet.accounts[0].address,
          BILLBOARD_ADDRESS,
          (securityDepositAdvertiser * 1e6).toString(),
        );
      }

      setTransactionStatus((prev) => ({
        ...prev,
        permitToken: {
          ...prev.permitToken,
          pending: false,
          completed: true,
        },
      }));

      setTransactionStatus((prev) => ({
        ...prev,
        registerProvider: {
          ...prev.registerProvider,
          pending: true,
          error: null,
        },
      }));

      const tx = permitFromToken
        ? getMulticall3Contract(signer).aggregate([
            {
              target: USDC_ADDRESS,
              data: permitFromToken?.encodedPermit,
            },
            {
              target: contract.target,
              data: contract.interface.encodeFunctionData(
                "registerBillboardAdvertiser",
                [handle],
              ),
            },
          ])
        : await contract.registerBillboardAdvertiser(handle);
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
      if (transactionStatus.permitToken.pending) {
        setTransactionStatus((prev) => ({
          ...prev,
          permitToken: {
            ...prev.permitToken,
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
      throw new Error("File size exceeds the maximum limit of 2MB");
    }
    if (image.type !== "image/png" && image.type !== "image/jpeg") {
      throw new Error("Only PNG or JPG images are allowed");
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
        "https://uploadimagetoswarmy-pe2o27xb6q-ew.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData: imageBase64,
          }),
        },
      );
      const data = await response.json();
      return data as { success: boolean; hash: string };
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
    allowanceUSDC,
    usdcBalance,

    // Token operations
    tokenBalance,
    buyBBT,

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
