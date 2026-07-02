// Provides the browser globals the production code touches when run under
// jest's `node` test environment (no jsdom installed).

class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  clear(): void {
    this.store.clear()
  }
  // enumeration API (used by listScopedSessions to find every agent's scope)
  get length(): number {
    return this.store.size
  }
  key(i: number): string | null {
    return [...this.store.keys()][i] ?? null
  }
}

const g = globalThis as any

g.localStorage = new MemoryStorage()
g.window = g.window || {}
g.window.localStorage = g.localStorage
g.window.location = g.window.location || { protocol: 'http:', search: '' }
