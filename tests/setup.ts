/**
 * Test setup: restore the `localStorage` global that jsdom defines but vitest 4
 * does not expose. The browser half reads `localStorage` directly (see
 * `src/client/assistants.ts`), as a real page may, so a jsdom spec needs it.
 * @module spa-assistant/tests/setup
 */

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return store.size
    },
    clear: () => {
      store.clear()
    },
    getItem: key => (store.has(key) ? store.get(key)! : null),
    key: index => [...store.keys()][index] ?? null,
    removeItem: key => {
      store.delete(key)
    },
    setItem: (key, value) => {
      store.set(key, String(value))
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true })
}
