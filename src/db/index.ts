// ============================================================================
// LendingOS Database — Initialization and access
// ============================================================================
import { loadDB, saveDB } from './services';
import { createSeedData } from './seed';
import type { Database } from './schema';

let dbInstance: Database | null = null;
let listeners: Array<() => void> = [];

export async function initDB(): Promise<Database> {
  const existing = loadDB();
  if (existing) {
    dbInstance = existing as Database;
  } else {
    dbInstance = await createSeedData();
    saveDB(dbInstance);
  }
  return dbInstance!;
}

export function getDB(): Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return dbInstance;
}

export function updateDB(updater: (db: Database) => void) {
  if (!dbInstance) throw new Error('Database not initialized');
  updater(dbInstance);
  saveDB(dbInstance);
  listeners.forEach(l => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function resetDB() {
  localStorage.removeItem('lendingos_db_v1');
  dbInstance = null;
  listeners.forEach(l => l());
}

export { loadDB, saveDB };
