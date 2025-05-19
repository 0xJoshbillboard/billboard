const dotenv = require("dotenv");

dotenv.config();

const swarmyURL = `https://api.swarmy.cloud/api/data/bin?k=${process.env.SWARMY_KEY}`;
const swarmyURLWithReference = (reference) =>
  `https://api.swarmy.cloud/files/${reference}?k=${process.env.SWARMY_KEY}`;

const rpcUrl = `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API}`;

module.exports = {
  swarmyURL,
  swarmyURLWithReference,
  rpcUrl,
};
