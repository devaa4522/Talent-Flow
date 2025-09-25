// Reset IndexedDB and localStorage for a clean slate
// Run with: node ./scripts/reset-seed.js

const DB_NAME = 'talentflow_db_v6';
const LS_KEYS = ['tf_settings', 'tftheme'];

(async () => {
  if ('indexedDB' in globalThis) {
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = resolve;
      req.onerror = reject;
      req.onblocked = resolve;
    });
    console.log(`[seed:reset] Deleted IndexedDB ${DB_NAME}`);
  }

  try {
    for (const k of LS_KEYS) {
      localStorage.removeItem(k);
    }
  } catch {}

  console.log("[seed:reset] Done");
})();
