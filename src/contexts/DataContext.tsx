import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Database } from '../db/schema';
import { initDB, getDB, subscribe, updateDB, resetDB } from '../db/index';
import { writeAuditLog } from '../db/services';

interface DataContextType {
  db: Database | null;
  loading: boolean;
  refresh: () => void;
  mutate: (updater: (db: Database) => void) => void;
  audit: (action: string, entityType: string, entityId: string, details: string, before?: any, after?: any) => Promise<void>;
  reset: () => void;
  currentUser: { id: string; name: string };
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDB()
      .then(initialDb => {
        setDb(initialDb);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to initialize database in DataProvider:', error);
        setLoading(false);
        // Try to get whatever database state exists
        const currentDb = getDB();
        if (currentDb) {
          setDb(currentDb);
        }
      });
    
    const unsubscribe = subscribe(() => {
      const currentDb = getDB();
      if (currentDb) {
        setDb({ ...currentDb });
      }
    });
    
    return unsubscribe;
  }, []);

  const refresh = useCallback(() => {
    const currentDb = getDB();
    if (currentDb) {
      setDb({ ...currentDb });
    }
  }, []);

  const mutate = useCallback((updater: (db: Database) => void) => {
    updateDB(updater);
  }, []);

  const audit = useCallback(async (
    action: string,
    entityType: string,
    entityId: string,
    details: string,
    before?: any,
    after?: any
  ) => {
    const currentDb = getDB();
    if (!currentDb) return;
    await writeAuditLog(
      currentDb,
      action,
      entityType,
      entityId,
      details,
      { id: 'U-ADMIN', name: 'Admin User' },
      before,
      after
    );
    updateDB(() => {}); // trigger refresh
  }, []);

  const reset = useCallback(() => {
    resetDB();
    initDB().then(initialDb => {
      setDb(initialDb);
    });
  }, []);

  return (
    <DataContext.Provider value={{
      db,
      loading,
      refresh,
      mutate,
      audit,
      reset,
      currentUser: { id: 'U-ADMIN', name: 'Admin User' },
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDB() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    // Return safe default instead of throwing
    return {
      db: null,
      loading: true,
      refresh: () => {},
      mutate: () => {},
      audit: async () => {},
      reset: () => {},
      currentUser: { id: 'U-ADMIN', name: 'Admin User' },
    };
  }
  return ctx;
}
