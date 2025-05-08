#!/bin/bash

# Set these variables:
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
PROXY_ADDRESS="0xYourProxyAddress"
IMPL_ADDRESS="0xYourImplementationAddress"
NETWORK="mainnet" # or sepolia, goerli, etc.

# Etherscan API URL (change for testnets)
if [ "$NETWORK" = "mainnet" ]; then
  ETHERSCAN_API="https://api.etherscan.io/api"
elif [ "$NETWORK" = "sepolia" ]; then
  ETHERSCAN_API="https://api-sepolia.etherscan.io/api"
elif [ "$NETWORK" = "goerli" ]; then
  ETHERSCAN_API="https://api-goerli.etherscan.io/api"
else
  echo "Unsupported network"
  exit 1
fi

# Call the Etherscan API to set the implementation
curl -X POST "$ETHERSCAN_API" \
  -d "module=contract" \
  -d "action=verifyproxycontract" \
  -d "apikey=$ETHERSCAN_API_KEY" \
  -d "address=$PROXY_ADDRESS" \
  -d "expectedimplementation=$IMPL_ADDRESS"