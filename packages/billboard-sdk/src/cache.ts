import { Billboard } from "./index";

export class BillboardCache {
  private static readonly CACHE_PREFIX = "billboard_cache_";
  private static memoryCache: Record<
    string,
    { data: Billboard | Billboard[]; timestamp: number }
  > = {};

  private static isLocalStorageAvailable(): boolean {
    try {
      if (typeof localStorage !== "undefined") {
        const testKey = "__test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  public static set(
    key: string,
    data: Billboard | Billboard[],
    expiryTimeMs: number = 21600000, // 6 hours (6 * 60 * 60 * 1000)
  ): void {
    const cacheKey = this.CACHE_PREFIX + key;
    const cacheData = {
      data,
      timestamp: Date.now() + expiryTimeMs,
    };

    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } else {
      this.memoryCache[cacheKey] = cacheData;
    }
  }

  public static get<T extends Billboard | Billboard[]>(key: string): T | null {
    const cacheKey = this.CACHE_PREFIX + key;

    let cacheData: { data: T; timestamp: number } | null = null;

    if (this.isLocalStorageAvailable()) {
      const storedData = localStorage.getItem(cacheKey);
      if (storedData) {
        cacheData = JSON.parse(storedData);
      }
    } else {
      cacheData =
        (this.memoryCache[cacheKey] as
          | { data: T; timestamp: number }
          | undefined) || null;
    }

    if (!cacheData) {
      return null;
    }

    if (cacheData.timestamp < Date.now()) {
      this.remove(key);
      return null;
    }

    return cacheData.data;
  }

  public static remove(key: string): void {
    const cacheKey = this.CACHE_PREFIX + key;

    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(cacheKey);
    } else {
      delete this.memoryCache[cacheKey];
    }
  }

  public static clear(): void {
    if (this.isLocalStorageAvailable()) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      this.memoryCache = {};
    }
  }
}
