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
    initDB().then(initialDb => {
      setDb(initialDb);
      setLoading(false);
    });
    
    const unsubscribe = subscribe(() => {
      setDb({ ...getDB() });
    });
    
    return unsubscribe;
  }, []);

  const refresh = useCallback(() => {
    setDb({ ...getDB() });
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
  if (!ctx) throw new Error('useDB must be used within DataProvider');
  return ctx;
}
