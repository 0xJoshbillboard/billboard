import {
  Contract,
  BrowserProvider,
  BigNumberish,
  getBigInt,
  JsonRpcProvider,
} from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useState } from "react";
import { BillboardSDK } from "billboard-sdk";
import {
  BILLBOARD_ADDRESS,
  CONTRACT_ABI,
  GOVERNANCE_ADDRESS,
  GOVERNANCE_ABI,
  USDC_ADDRESS,
  USDC_MOCK_ABI,
  BILLBOARD_TOKEN_ADDRESS,
  BILLBOARD_TOKEN_ABI,
} from "../utils/contracts";
import { chains } from "../utils/chains";

const billboardSDK = new BillboardSDK();

export interface Billboard {
  owner: string;
  expiryTime: number;
  description: string;
  link: string;
  ipfsHash: string;
}

export interface Proposal {
  id: number;
  duration: number;
  pricePerBillboard: number;
  securityDeposit: number;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  merkleRoot: string;
  snapshotBlock: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function useBillboard() {
  const [{ wallet }] = useConnectWallet();
  const [contract, setContract] = useState<Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<Contract | null>(null);
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [governanceSettings, setGovernanceSettings] = useState<{
    price: null | number;
    duration: null | number;
  }>({ price: null, duration: null });
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const setContracts = async () => {
      if (wallet?.provider) {
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
        const provider = new JsonRpcProvider(chains[0].rpcUrl);
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

  useEffect(() => {
    const getGovSettings = async () => {
      if (governanceContract) {
        const [price, duration] = await Promise.all([
          governanceContract.pricePerBillboard(),
          governanceContract.duration(),
        ]);

        const readablePrice = Number(price) / 1_000_000;
        const durationInSeconds = Number(duration);

        setGovernanceSettings({
          price: readablePrice,
          duration: durationInSeconds,
        });
      }
    };
    getGovSettings();
  }, [governanceContract]);

  useEffect(() => {
    if (wallet && usdcContract) {
      fetchUsdcBalance().then((balance) => {
        setUsdcBalance(balance);
      });
    }
  }, [wallet, usdcContract]);

  useEffect(() => {
    if (wallet && tokenContract) {
      fetchTokenBalance().then((balance) => {
        setTokenBalance(balance);
      });
    }
  }, [wallet, tokenContract]);

  useEffect(() => {
    if (wallet && contract) {
      fetchBillboards().then((billboards) => {
        setBillboards(billboards);
      });
    }
  }, [wallet, contract]);

  useEffect(() => {
    if (wallet && governanceContract) {
      fetchProposals();
      fetchVotingStatus();
    }
  }, [wallet, governanceContract]);

  const fetchTokenBalance = async () => {
    if (!tokenContract || !wallet?.accounts[0].address) {
      return "0";
    }
    const balance = await tokenContract.balanceOf(wallet.accounts[0].address);
    return (Number(balance) / 1e18).toString();
  };

  const fetchProposals = async () => {
    if (!governanceContract) return;

    try {
      const proposalCount = await governanceContract.proposals.length;
      const fetchedProposals: Proposal[] = [];

      for (let i = 0; i < proposalCount; i++) {
        const proposal = await governanceContract.getProposal(i);
        fetchedProposals.push({
          id: i,
          duration: Number(proposal[0]),
          pricePerBillboard: Number(proposal[1]),
          securityDeposit: Number(proposal[2]),
          votesFor: Number(proposal[3]),
          votesAgainst: Number(proposal[4]),
          executed: proposal[5],
          merkleRoot: proposal[6],
          snapshotBlock: Number(proposal[7]),
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
    duration: number,
    pricePerBillboard: number,
    securityDeposit: number,
    merkleRoot: string,
    snapshotBlock: number,
    proposerBalance: number,
    proposerProof: string[],
  ) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      const tx = await governanceContract.createProposal(
        duration,
        pricePerBillboard,
        securityDeposit,
        merkleRoot,
        snapshotBlock,
        proposerBalance,
        proposerProof,
      );
      await tx.wait();
      await fetchProposals();
      return tx;
    } catch (error) {
      console.error("Failed to create proposal:", error);
      throw error;
    }
  };

  const vote = async (
    proposalId: number,
    support: boolean,
    amount: number,
    proof: string[],
  ) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      const tx = await governanceContract.vote(
        proposalId,
        support,
        amount,
        proof,
      );
      await tx.wait();
      await fetchProposals();
      await fetchVotingStatus();
      return tx;
    } catch (error) {
      console.error("Failed to vote:", error);
      throw error;
    }
  };

  const executeProposal = async (proposalId: number) => {
    if (!governanceContract) throw new Error("Governance contract not defined");
    if (!wallet) throw new Error("Wallet not connected");

    try {
      const tx = await governanceContract.executeProposal(proposalId);
      await tx.wait();
      await fetchProposals();
      const [price, duration] = await Promise.all([
        governanceContract.pricePerBillboard(),
        governanceContract.duration(),
      ]);
      setGovernanceSettings({
        price: Number(price) / 1_000_000,
        duration: Number(duration),
      });
      return tx;
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      throw error;
    }
  };

  const getUSDCMock = async () => {
    if (!wallet) throw new Error("Wallet not connected");
    await usdcContract?.mint(wallet?.accounts[0].address, 10000e6);
  };

  const approveUSDC = async (amount: string) => {
    if (!usdcContract || !contract) {
      throw new Error("USDC not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");
    await usdcContract.approve(BILLBOARD_ADDRESS, amount);
  };

  const fetchUsdcBalance = async () => {
    if (!usdcContract || !wallet?.accounts[0].address) {
      return "0";
    }
    const balance = await usdcContract.balanceOf(wallet?.accounts[0].address);
    return (Number(balance) / 1_000_000).toLocaleString() + "";
  };

  const allowanceUSDC = async () => {
    if (!usdcContract) {
      throw new Error("USDC not defined");
    }
    return (await usdcContract.allowance(
      wallet?.accounts[0].address,
      BILLBOARD_ADDRESS,
    )) as BigNumberish;
  };

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
    const allowance = await allowanceUSDC();
    if (getBigInt(allowance) < getBigInt("1000000000")) {
      await approveUSDC("1000000000");
    }
    let url;
    if (file) {
      url = await uploadImage(file);
    } else if (cid) {
      url = { cid };
    } else {
      throw new Error("No file or CID provided");
    }
    if (!url?.cid) {
      throw new Error("url not defined");
    }
    try {
      const tx = await contract.purchaseBillboard(description, link, url.cid);
      await tx.wait();
      return { cid: url.cid, tx };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to purchase billboard");
    }
  };

  const extend = async (index: number) => {
    if (!contract || !governanceContract) {
      throw new Error("Contract not defined");
    }
    if (!wallet) throw new Error("Wallet not connected");
    const allowance = await allowanceUSDC();
    const governancePrice = await governanceContract.pricePerBillboard();

    if (getBigInt(allowance) < getBigInt(governancePrice)) {
      await approveUSDC(governancePrice.toString());
    }
    const tx = await contract.extendBillboard(index);
    await tx.wait();
    return tx;
  };

  const getAds = async () => {
    return billboardSDK.getAds("billboard-ui");
  };

  const getAd = async (handle: string) => {
    return billboardSDK.showAd(handle);
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

  const fetchBillboards = async () => {
    if (!contract || !wallet?.accounts[0].address) {
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
    }));
  };

  return {
    buy,
    extend,
    approveUSDC,
    allowanceUSDC,
    getUSDCMock,
    getAds,
    governanceSettings,
    billboards,
    fetchBillboards,
    usdcBalance,
    tokenBalance,
    proposals,
    hasVoted,
    createProposal,
    vote,
    executeProposal,
    fetchProposals,
    fetchVotingStatus,
    uploadImage,
  };
}
