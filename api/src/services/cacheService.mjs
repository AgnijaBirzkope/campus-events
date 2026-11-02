import { env } from '../config/env.mjs';

class MemoryCache {
  #entries = new Map();

  async getOrSet(key, load) {
    const cached = this.#entries.get(key);
    if (cached && cached.expiresAt > Date.now()) return structuredClone(cached.value);
    const value = await load();
    this.#entries.set(key, { value: structuredClone(value), expiresAt: Date.now() + env.cacheTtlMs });
    return value;
  }

  clear() {
    this.#entries.clear();
  }
}

export const cache = new MemoryCache();
