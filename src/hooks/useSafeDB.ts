import { useDB } from '../contexts/DataContext';
import type { Database } from '../db/schema';

/**
 * Safe database access hook with loading and error states
 */
export function useSafeDB() {
  const context = useDB();
  
  // Return safe defaults if context is not available
  if (!context) {
    return {
      db: null as Database | null,
      loading: true,
      error: null as string | null,
      refresh: () => {},
      mutate: () => {},
      audit: async () => {},
      reset: () => {},
      currentUser: { id: 'U-ADMIN', name: 'Admin User' },
    };
  }
  
  return {
    ...context,
    error: null as string | null,
  };
}

/**
 * Hook to check if database is ready
 */
export function useDBReady() {
  const { db, loading } = useSafeDB();
  return {
    isReady: !loading && db !== null,
    isLoading: loading,
    db,
  };
}
