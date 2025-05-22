const { ethers } = require("ethers");
const abi = require("../../abi");
const governanceAbi = require("../../abi-gov");
const { rpcUrl } = require("../config");

const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  "0x4bfd7838f67b463a59b04e20d1da9a36eb4855c3",
  abi,
  provider,
);
const governanceContract = new ethers.Contract(
  "0xdf570c055f7c6416b07a8d2258f1af40eae1a4ec",
  governanceAbi,
  provider,
);

module.exports = {
  provider,
  contract,
  governanceContract,
};
