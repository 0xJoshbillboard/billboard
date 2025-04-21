const infuraKey = "da6fa5c1aa6546b882fee23987d3b294";
const rpcUrl = (chain: string) => `https://${chain}.infura.io/v3/${infuraKey}`;

const chainNames = {
  optimismSepolia: "optimism-sepolia",
  optimismMainnet: "optimism-mainnet",
  local: "local",
};

export const chains = [
  {
    id: "0xaa37dc",
    token: "ETH",
    label: "Optimism Sepolia",
    rpcUrl: rpcUrl(chainNames.optimismSepolia),
  },
  // {
  //   id: "0xa",
  //   token: "ETH",
  //   label: "Optimism",
  //   rpcUrl: rpcUrl(chainNames.optimismMainnet),
  // },
  // {
  //   id: "0x7a69",
  //   token: "ETH",
  //   label: "Local",
  //   rpcUrl: "http://127.0.0.1:8545",
  // },
];
