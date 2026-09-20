import { useState, useEffect } from 'react';
import { getDB } from '../db';
import type { AuditEntry } from '../db/schema';

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const db = getDB();
        const auditLogs = [...db.auditLog];
        // Sort by timestamp descending (most recent first)
        auditLogs.sort((a: AuditEntry, b: AuditEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(auditLogs);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  return { logs, isLoading };
}
