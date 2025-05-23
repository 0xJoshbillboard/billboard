import { BrowserProvider, Contract, TypedDataDomain, Signature } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";

export default function useERC20Permit() {
  const [{ wallet }] = useConnectWallet();
  const getTimestampInSeconds = () => {
    return BigInt(Math.floor(Date.now() / 1000));
  };

  const createDomain = (
    chainId: number,
    verifyingContract: string,
    name: string,
    version: string,
  ): TypedDataDomain => {
    return {
      name,
      version,
      verifyingContract,
      chainId,
    };
  };

  const createValues = (
    owner: string,
    spender: string,
    value: string | bigint,
    nonce: string | bigint,
    deadline: string | bigint,
  ) => {
    return {
      owner,
      spender,
      value: BigInt(value).toString(),
      nonce: BigInt(nonce).toString(),
      deadline: BigInt(deadline).toString(),
    };
  };

  const getNonces = async (token: Contract, owner: string) => {
    const nonce = await token.nonces(owner);
    return BigInt(nonce.toString());
  };

  const getPermit = async (
    token: Contract,
    owner: string,
    spender: string,
    value: string | bigint,
    version = "1",
  ) => {
    const chainId = wallet.chains[0].id;
    const name = await token.name();

    const domain = createDomain(
      Number(chainId),
      await token.getAddress(),
      name,
      version,
    );
    const nonce = await getNonces(token, owner);
    const deadline = getTimestampInSeconds() + BigInt(4200);

    const values = createValues(owner, spender, value, nonce, deadline);

    const provider = new BrowserProvider(wallet.provider);
    const signer = await provider.getSigner();
    const signature = await signer.signTypedData(domain, types, values);

    const sig = Signature.from(signature as any);
    const r = sig.r;
    const s = sig.s;
    const v = sig.v;

    return {
      owner,
      spender,
      value: BigInt(value).toString(),
      deadline: deadline.toString(),
      v,
      r,
      s,
      signature,
      encodedPermit: permit(token, owner, spender, value, deadline, v, r, s),
    };
  };

  const permit = (
    token: Contract,
    owner: string,
    spender: string,
    value: string | bigint,
    deadline: string | bigint,
    v: number,
    r: string,
    s: string,
  ) => {
    return token.interface.encodeFunctionData("permit", [
      owner,
      spender,
      BigInt(value),
      BigInt(deadline),
      v,
      r,
      s,
    ]);
  };

  return {
    createDomain,
    createValues,
    permit,
    getNonces,
    getPermit,
    getTimestampInSeconds,
  };
}

const types = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};
