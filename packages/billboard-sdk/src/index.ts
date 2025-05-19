import { BillboardCache } from "./cache";
import { getAds } from "./utils/api";

export interface Billboard {
  link: string;
  description: string;
  hash: string;
  expiryTime: number;
  url: string;
}

export class BillboardSDK {
  public async showAd(handle: string): Promise<Billboard | null> {
    const cacheKey = `showAd_${handle}`;
    const cachedAd = BillboardCache.get<Billboard>(cacheKey);

    if (cachedAd) {
      return cachedAd;
    }

    try {
      const response = await fetch(getAds, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle, amountOfAds: 1, getAllAds: false }),
      });

      const data = await response.json();

      if (!data.success || !data.result) {
        return null;
      }

      const ad = {
        hash: data.result.cid,
        url: data.result.url,
        link: data.result.link,
        description: data.result.description,
        expiryTime: data.result.expiryTime,
      };

      BillboardCache.set(cacheKey, ad);

      return ad;
    } catch (error) {
      console.error(error);
      throw new Error(`Error while fetching ad: ${error}`);
    }
  }

  public async getAds(handle: string): Promise<Billboard[]> {
    const cacheKey = `getAds_${handle}`;
    const cachedAds = BillboardCache.get<Billboard[]>(cacheKey);

    if (cachedAds) {
      return cachedAds;
    }

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

      const ads = data.ads.map((ad: Billboard) => ({
        hash: ad.hash,
        url: ad.url,
        link: ad.link,
        description: ad.description,
        expiryTime: ad.expiryTime,
      }));

      BillboardCache.set(cacheKey, ads);

      return ads;
    } catch (error) {
      console.error(error);
      throw new Error(`Error while fetching ads: ${error}`);
    }
  }
}

export default BillboardSDK;
