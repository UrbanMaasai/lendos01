import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Search, Filter, Download, Calendar, User, Activity, Hash, ChevronDown, X } from 'lucide-react';
import { useAuditLog } from '../hooks/useAuditLog';

export default function AuditLogExplorer() {
  const { t } = useLanguage();
  const { logs, isLoading } = useAuditLog();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map(log => log.action));
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueUsers = useMemo(() => {
    const users = new Set(logs.map(log => log.userName));
    return Array.from(users).sort();
  }, [logs]);

  const uniqueEntityTypes = useMemo(() => {
    const types = new Set(logs.map(log => log.entityType));
    return Array.from(types).sort();
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          log.id.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.entityId.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Action filter
      if (selectedAction && log.action !== selectedAction) return false;

      // User filter
      if (selectedUser && log.userName !== selectedUser) return false;

      // Entity type filter
      if (selectedEntityType && log.entityType !== selectedEntityType) return false;

      // Date range filter
      if (dateFrom) {
        const logDate = new Date(log.timestamp);
        const fromDate = new Date(dateFrom);
        if (logDate < fromDate) return false;
      }
      if (dateTo) {
        const logDate = new Date(log.timestamp);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (logDate > toDate) return false;
      }

      return true;
    });
  }, [logs, searchTerm, selectedAction, selectedUser, selectedEntityType, dateFrom, dateTo]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User', 'Details', 'Hash'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.action,
      log.entityType,
      log.entityId,
      log.userName,
      log.details,
      log.hash.substring(0, 16) + '...',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAction('');
    setSelectedUser('');
    setSelectedEntityType('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || selectedAction || selectedUser || selectedEntityType || dateFrom || dateTo;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log Explorer</h1>
          <p className="text-gray-600 mt-1">
            Search, filter, and export audit logs for compliance review
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV ({filteredLogs.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, action, entity, details, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
              Active
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Type
              </label>
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {uniqueEntityTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredLogs.length} of {logs.length} entries
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No audit logs found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.entityType}</span>
                        <span className="text-xs text-gray-500 font-mono">{log.entityId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {log.userName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="text-xs font-mono text-gray-500">
                          {log.hash.substring(0, 16)}...
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
