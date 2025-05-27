const { ethers } = require("ethers");
const abi = require("../../abi");
const governanceAbi = require("../../abi-gov");
const { rpcUrl } = require("../config");

const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  "0xeD6725010B662BccCcEC3Cb1cCe83855809c1Cc4",
  abi,
  provider,
);
const governanceContract = new ethers.Contract(
  "0x1875986B556048742C4597165510F19e9FDb42Fc",
  governanceAbi,
  provider,
);

module.exports = {
  provider,
  contract,
  governanceContract,
};
