import billboardABI from "../../../contracts/out/BillboardRegistry.sol/BillboardRegistry.json";
import governanceABI from "../../../contracts/out/BillboardGovernance.sol/BillboardGovernance.json";
import usdcMockABI from "../../../contracts/out/USDCMock.sol/USDCMock.json";
import billboardTokenABI from "../../../contracts/out/BillboardToken.sol/BillboardToken.json";

export const CONTRACT_ABI = billboardABI.abi;
export const GOVERNANCE_ABI = governanceABI.abi;
export const USDC_MOCK_ABI = usdcMockABI.abi;
export const BILLBOARD_TOKEN_ABI = billboardTokenABI.abi;

export const BILLBOARD_ADDRESS = "0x7a4dcb2f541954bf5494d91e62c5de91febcea45";
export const GOVERNANCE_ADDRESS = "0xdacd71620c98304984659a37f852504c89b818fc";
export const USDC_ADDRESS = "0x23e9503e04ce61cf850c0b10068acf5ad11cf2c6";
export const BILLBOARD_TOKEN_ADDRESS =
  "0x98769c45efc90ad069cda31db977c423ee8a8f3a";
