const { ethers } = require("ethers");
const abi = require("../../abi");
const governanceAbi = require("../../abi-gov");
const { rpcUrl } = require("../config");

const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  "0xc5533b322861de8c894fc44ec421a02395b83df5",
  abi,
  provider,
);
const governanceContract = new ethers.Contract(
  "0x9527f41eb97173ea364b775b4ab99578110fec5f",
  governanceAbi,
  provider,
);

module.exports = {
  provider,
  contract,
  governanceContract,
};
