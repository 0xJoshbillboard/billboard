import {
  getDoc,
  setDoc,
  updateDoc,
  doc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { getImage, uploadImage } from "./utils/api";

export interface Billboard {
  link: string;
  description: string;
  ipfsHash: string;
  expiryTime: number;
  url: string;
}

interface Ad {
  link: string;
  description: string;
  ipfsHash: string;
  expiryTime: number;
  url?: string;
  id?: string;
  cid?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export class BillboardSDK {
  public async getAds(handle?: string) {
    try {
      if (handle) {
        const handleCounter = await getDoc(doc(db, "providers", handle));
        if (handleCounter) {
          await updateDoc(doc(db, "providers", handle), {
            counter: handleCounter.data()?.counter + 1,
          });
        }
      } else {
        await setDoc(doc(db, "providers", "handle"), {
          counter: 1,
        });
      }
      const ads = await getDocs(collection(db, "active_ads"));
      const adsWithCids = ads.docs.map((ad) => ({
        link: ad.data().link,
        description: ad.data().description,
        ipfsHash: ad.data().ipfsHash,
        expiryTime: ad.data().expiryTime,
      }));
      const withImages = await Promise.all(
        adsWithCids.map(async (ad: Ad) => {
          const response = await fetch(getImage, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cid: ad.ipfsHash }),
          });
          const imageUrl = (await response.json()) as { result?: string };
          return { ...ad, url: imageUrl.result || "" };
        }),
      );
      return withImages;
    } catch (error) {
      console.error(error);
      throw new Error(`Error while fetching for ads: ${error}`);
    }
  }

  public async uploadImage(image: File) {
    if (image.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds the maximum limit of 5MB");
    }
    try {
      const arrayBuffer = await image.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const binary = bytes.reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        "",
      );
      const imageBase64 = btoa(binary);

      const response = await fetch(uploadImage, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData: imageBase64 }),
      });
      const data = await response.json();
      return data as { success: boolean; cid: string };
    } catch (error) {
      console.error(error);
      throw new Error(`Error while uploading image: ${error}`);
    }
  }
}

export default BillboardSDK;
