# Billboard

[![Build and Tests](https://github.com/0xjoshbillboard/billboard/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/0xjoshbillboard/billboard/actions/workflows/build-and-test.yml)
[![Smart Contract Tests](https://github.com/0xjoshbillboard/billboard/actions/workflows/contracts.yml/badge.svg)](https://github.com/0xjoshbillboard/billboard/actions/workflows/contracts.yml)

## Overview

Billboard is a decentralized advertising platform that allows users to purchase and manage digital billboard spaces using blockchain technology. The platform enables advertisers to display their content while leveraging governance mechanisms for community-driven price and duration settings.

## Repository Structure

This monorepo contains several packages:

- `packages/contracts`: Solidity smart contracts for the Billboard platform
- `packages/ui`: Frontend application for interacting with the Billboard platform
- `packages/billboard-sdk`: JavaScript SDK for integrating with the Billboard platform
- `packages/functions`: Serverless functions for backend operations like IPFS image handling

## Getting Started

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/0xjoshbillboard/billboard.git
   cd billboard
   ```

2. Install dependencies:

   ```
   yarn install
   ```

3. Build all packages:
   ```
   yarn build
   ```

## Usage

### Smart Contracts

The contracts package includes:

- `BillboardRegistry`: Manages billboard ownership and content
- `BillboardGovernance`: Handles governance proposals for price and duration settings
- `BillboardToken`: ERC20 token used for governance voting
