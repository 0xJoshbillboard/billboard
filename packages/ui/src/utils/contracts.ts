import billboardABI from "../../../contracts/out/BillboardRegistry.sol/BillboardRegistry.json";
import governanceABI from "../../../contracts/out/BillboardGovernance.sol/BillboardGovernance.json";
import usdcMockABI from "../../../contracts/out/USDCMock.sol/USDCMock.json";
import billboardTokenABI from "../../../contracts/out/BillboardToken.sol/BillboardToken.json";
import { Contract } from "ethers";

export const CONTRACT_ABI = billboardABI.abi;
export const GOVERNANCE_ABI = governanceABI.abi;
export const USDC_MOCK_ABI = usdcMockABI.abi;
export const BILLBOARD_TOKEN_ABI = billboardTokenABI.abi;

export const BILLBOARD_ADDRESS = "0xc5533b322861de8c894fc44ec421a02395b83df5";
export const GOVERNANCE_ADDRESS = "0x9527f41eb97173ea364b775b4ab99578110fec5f";
export const USDC_ADDRESS = "0xe17612de297d7a6ac3c8af568a556b62d1f2074c";
export const BILLBOARD_TOKEN_ADDRESS =
  "0xc6532522fa6c05533047c17896ea56d41a2e127f";

  export const Multicall3 = new Contract('0xcA11bde05977b3631167028862bE2a173976CA11', [
    "function aggregate(tuple(address target, bytes data)[] calls) public returns (uint256 blockNumber, bytes[] memory returnData)"
  ]
  );
