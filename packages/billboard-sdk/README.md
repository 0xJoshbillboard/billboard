# Billboard SDK

A JavaScript/TypeScript SDK for interacting with the Billboard decentralized advertising platform. This SDK provides a simple interface for displaying and managing digital billboard advertisements.

## Features

- Retrieve advertisement details and metadata
- Simple and intuitive API

## Installation

```bash
npm install @billboard/sdk
# or
yarn add @billboard/sdk
```

## Usage

### Basic Usage

```typescript
import { BillboardSDK } from "@billboard/sdk";

// Initialize the SDK
const billboard = new BillboardSDK();

// Display an advertisement
const ad = await billboard.showAd("billboard-handle");
if (ad) {
  console.log("Advertisement:", {
    link: ad.link,
    description: ad.description,
    imageUrl: ad.url,
    expiryTime: ad.expiryTime,
  });
}

// Get all advertisements for a billboard
const ads = await billboard.getAds("billboard-handle");
console.log("All advertisements:", ads);
```

### API Reference

#### `showAd(handle: string): Promise<Billboard | null>`

Displays the current advertisement for a given billboard handle.

**Parameters:**

- `handle`: Your unique identifier

**Returns:**

- `Promise<Billboard | null>`: The current advertisement or null if none exists

#### `getAds(handle: string): Promise<Billboard[]>`

Retrieves all advertisements for a given billboard handle.

**Parameters:**

- `handle`: Your unique identifier

**Returns:**

- `Promise<Billboard[]>`: Array of advertisements

### Types

```typescript
interface Billboard {
  link: string;
  description: string;
  hash: string;
  expiryTime: number;
  url: string;
}
```

## License

MIT
