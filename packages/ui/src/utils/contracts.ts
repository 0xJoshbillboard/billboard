import billboardABI from "../../../contracts/out/BillboardRegistry.sol/BillboardRegistry.json";
import governanceABI from "../../../contracts/out/BillboardGovernance.sol/BillboardGovernance.json";
import usdcMockABI from "../../../contracts/out/USDCMock.sol/USDCMock.json";
import billboardTokenABI from "../../../contracts/out/BillboardToken.sol/BillboardToken.json";
import { Contract, Signer } from "ethers";

export const CONTRACT_ABI = billboardABI.abi;
export const GOVERNANCE_ABI = governanceABI.abi;
export const USDC_MOCK_ABI = usdcMockABI.abi;
export const BILLBOARD_TOKEN_ABI = billboardTokenABI.abi;

export const BILLBOARD_ADDRESS = "0xdf570c055f7c6416b07a8d2258f1af40eae1a4ec";
export const GOVERNANCE_ADDRESS = "0xdf570c055f7c6416b07a8d2258f1af40eae1a4ec";
export const USDC_ADDRESS = "0xaee0081992abdf6995c6196e8ae35345d2301a01";
export const BILLBOARD_TOKEN_ADDRESS =
  "0xddf9f3acf5fe99261ab8bb8867b322a8d245b9b3";

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
