import { ProcessedDocument } from "./types";

/**
 * Global document cache that persists across Next.js Hot Module Replacement (HMR).
 * 
 * In dev mode, module-level variables get reset when files change.
 * Using globalThis ensures the cache survives HMR reloads.
 */
const globalForCache = globalThis as unknown as {
  __documentCache: Map<string, ProcessedDocument>;
};

if (!globalForCache.__documentCache) {
  globalForCache.__documentCache = new Map<string, ProcessedDocument>();
}

export const documentCache = globalForCache.__documentCache;
