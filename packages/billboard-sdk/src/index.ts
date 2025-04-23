import { getAds } from "./utils/api";

export interface Billboard {
  link: string;
  description: string;
  ipfsHash: string;
  expiryTime: number;
  url: string;
}

export class BillboardSDK {
  public async showAd(handle: string): Promise<Billboard | null> {
    try {
      const response = await fetch(getAds, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle, amountOfAds: 1 }),
      });

      const data = await response.json();

      if (!data.success || !data.result) {
        return null;
      }

      return {
        ipfsHash: data.result.cid,
        url: data.result.url,
        link: data.result.link,
        description: data.result.description,
        expiryTime: data.result.expiryTime,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error while fetching ad: ${error}`);
    }
  }

  public async getAds(handle: string): Promise<Billboard[]> {
    try {
      const response = await fetch(getAds, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle,
          getAllAds: true,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.ads) {
        return [];
      }

      return data.ads.map((ad: Billboard) => ({
        ipfsHash: ad.ipfsHash,
        url: ad.url,
        link: ad.link,
        description: ad.description,
        expiryTime: ad.expiryTime,
      }));
    } catch (error) {
      console.error(error);
      throw new Error(`Error while fetching ads: ${error}`);
    }
  }
}

export default BillboardSDK;
