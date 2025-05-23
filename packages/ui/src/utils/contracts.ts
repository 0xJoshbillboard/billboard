import billboardABI from "../../../contracts/out/BillboardRegistry.sol/BillboardRegistry.json";
import governanceABI from "../../../contracts/out/BillboardGovernance.sol/BillboardGovernance.json";
import usdcMockABI from "../../../contracts/out/USDCMock.sol/USDCMock.json";
import billboardTokenABI from "../../../contracts/out/BillboardToken.sol/BillboardToken.json";
import { Contract, Signer } from "ethers";

export const CONTRACT_ABI = billboardABI.abi;
export const GOVERNANCE_ABI = governanceABI.abi;
export const USDC_MOCK_ABI = usdcMockABI.abi;
export const BILLBOARD_TOKEN_ABI = billboardTokenABI.abi;

export const BILLBOARD_ADDRESS = "0xed6725010b662bccccec3cb1cce83855809c1cc4";
export const GOVERNANCE_ADDRESS = "0x1875986b556048742c4597165510f19e9fdb42fc";
export const USDC_ADDRESS = "0x95a969d27835317179649aef24571902c601b922";
export const BILLBOARD_TOKEN_ADDRESS =
  "0x645c7c1f8fdd98967b07a2245d4aa92b920fbba9";

export const getMulticall3Contract = (signer: Signer) =>
  new Contract(
    "0xcA11bde05977b3631167028862bE2a173976CA11",
    [
      "function aggregate(tuple(address target, bytes data)[] calls) public returns (uint256 blockNumber, bytes[] memory returnData)",
    ],
    signer,
  );

export const getERC20PermitContract = (address: string) =>
  new Contract(address, BILLBOARD_TOKEN_ABI);
