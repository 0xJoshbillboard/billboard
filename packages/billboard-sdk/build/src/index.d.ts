export interface Billboard {
  link: string;
  description: string;
  ipfsHash: string;
  expiryTime: number;
  url: string;
}
export declare class BillboardSDK {
  getAds(handle?: string): Promise<
    {
      url: string;
      link: string;
      description: string;
      ipfsHash: string;
      expiryTime: number;
      id?: string | undefined;
      cid?: string | undefined;
    }[]
  >;
  uploadImage(image: File): Promise<{
    success: boolean;
    cid: string;
  }>;
}
export default BillboardSDK;
