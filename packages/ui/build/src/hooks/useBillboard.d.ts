import { BigNumberish } from 'ethers';
export interface Billboard {
    owner: string;
    expiryTime: number;
    description: string;
    link: string;
    ipfsHash: string;
}
export default function useBillboard(): {
    buy: (description: string, link: string, file: File | null, cid?: string) => Promise<{
        cid: any;
        tx: any;
    }>;
    extend: (index: number) => Promise<any>;
    approveUSDC: (amount: string) => Promise<void>;
    allowanceUSDC: () => Promise<BigNumberish>;
    getUSDCMock: () => Promise<void>;
    getAds: () => Promise<{
        url: string;
        link: string;
        description: string;
        ipfsHash: string;
        expiryTime: number;
        id?: string | undefined;
        cid?: string | undefined;
    }[]>;
    governanceSettings: {
        price: null | number;
        duration: null | number;
    };
    billboards: Billboard[];
    fetchBillboards: () => Promise<any>;
    usdcBalance: string;
};
//# sourceMappingURL=useBillboard.d.ts.map