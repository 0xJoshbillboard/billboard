import billboardABI from "../../../contracts/out/BillboardRegistry.sol/BillboardRegistry.json";
import governanceABI from "../../../contracts/out/BillboardGovernance.sol/BillboardGovernance.json";
import usdcMockABI from "../../../contracts/out/USDCMock.sol/USDCMock.json";
import billboardTokenABI from "../../../contracts/out/BillboardToken.sol/BillboardToken.json";

export const CONTRACT_ABI = billboardABI.abi;
export const GOVERNANCE_ABI = governanceABI.abi;
export const USDC_MOCK_ABI = usdcMockABI.abi;
export const BILLBOARD_TOKEN_ABI = billboardTokenABI.abi;

export const BILLBOARD_ADDRESS = "0x11508abf11400793d84b402553f4bf7e52ad8b26";
export const GOVERNANCE_ADDRESS = "0xb0e2089a9c233791623019051669b36f9a4135d4";
export const USDC_ADDRESS = "0x466953a161b63c00669243e8d135c77517126b21";
export const BILLBOARD_TOKEN_ADDRESS =
  "0x39f3eef1bc6e16c659ef1c352b92c166f41ba4f7";
