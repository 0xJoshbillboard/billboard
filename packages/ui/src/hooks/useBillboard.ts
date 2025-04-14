import { Contract, BrowserProvider, BigNumberish, getBigInt } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useState } from "react";
import {
  billboardABI,
  usdcMockABI,
  billboardGovernanceABI,
} from "../utils/abis";
import { BillboardSDK } from "billboard-sdk";

const CONTRACT_ADDRESS = "0x6A655887aD8Bce1D0a19a1092905100744330120";
const CONTRACT_ABI = billboardABI;

const GOVERNANCE_ADDRESS = "0x973d3B7fa5418B4577A0c68E56c24D120051B785";
const GOVERNANCE_ABI = billboardGovernanceABI;

const USDC_ADDRESS = "0x65046188900D3C1FE0c559983997267326a85D10";
const USDC_MOCK_ABI = usdcMockABI;

const billboardSDK = new BillboardSDK();

export interface Billboard {
  owner: string;
  expiryTime: number;
  description: string;
  link: string;
  ipfsHash: string;
}

export default function useBillboard() {
  const [{ wallet }] = useConnectWallet();
  const [contract, setContract] = useState<Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<Contract | null>(null);
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [governanceSettings, setGovernanceSettings] = useState<{
    price: null | number;
    duration: null | number;
  }>({ price: null, duration: null });
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");

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
        setContract(new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
        setUsdcContract(new Contract(USDC_ADDRESS, USDC_MOCK_ABI, signer));
        setGovernanceContract(govContract);
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

        // Convert price from decimal 6 to a readable format
        const readablePrice = Number(price) / 1_000_000;

        // Duration is a number of seconds (e.g., 30 days in seconds)
        // Convert duration from seconds to a readable format (e.g., "30 days")
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
    if (wallet && contract) {
      fetchBillboards().then((billboards) => {
        setBillboards(billboards);
      });
    }
  }, [wallet, contract]);

  // TODO remove when deving is done
  const getUSDCMock = async () => {
    await usdcContract?.mint(wallet?.accounts[0].address, 10000e6);
  };

  const approveUSDC = async (amount: string) => {
    if (!usdcContract || !contract) {
      throw new Error("USDC not defined");
    }
    await usdcContract.approve(CONTRACT_ADDRESS, amount);
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
      CONTRACT_ADDRESS,
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
    const allowance = await allowanceUSDC();
    if (getBigInt(allowance) < getBigInt("1000000000")) {
      await approveUSDC("1000000000");
    }
    let url;
    if (file) {
      url = await billboardSDK.uploadImage(file);
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
    // Check if we have enough allowance for extending the billboard
    const allowance = await allowanceUSDC();
    const governancePrice = await governanceContract.pricePerBillboard();

    if (getBigInt(allowance) < getBigInt(governancePrice)) {
      // If allowance is insufficient, approve the required amount
      await approveUSDC(governancePrice.toString());
    }
    const tx = await contract.extendBillboard(index);
    await tx.wait();
    return tx;
  };

  const getAds = async () => {
    return billboardSDK.getAds();
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
  };
}
