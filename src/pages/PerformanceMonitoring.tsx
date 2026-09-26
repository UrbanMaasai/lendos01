import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface ApiEndpoint {
  path: string;
  method: string;
  avgResponseTime: number;
  successRate: number;
  requestsLastHour: number;
  errorsLastHour: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  endpoint?: string;
  stack?: string;
}

export default function PerformanceMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate loading metrics
  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMetrics = () => {
    // Simulate system metrics
    setMetrics([
      {
        name: 'CPU Usage',
        value: 45 + Math.random() * 20,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        change: 2.3,
      },
      {
        name: 'Memory Usage',
        value: 62 + Math.random() * 15,
        unit: '%',
        status: 'healthy',
        trend: 'up',
        change: 5.1,
      },
      {
        name: 'Database Connections',
        value: 23,
        unit: '/100',
        status: 'healthy',
        trend: 'stable',
        change: 0,
      },
      {
        name: 'Active Sessions',
        value: 147,
        unit: '',
        status: 'healthy',
        trend: 'up',
        change: 12,
      },
      {
        name: 'Queue Length',
        value: 8,
        unit: 'jobs',
        status: 'healthy',
        trend: 'down',
        change: -3,
      },
      {
        name: 'Error Rate',
        value: 0.12,
        unit: '%',
        status: 'healthy',
        trend: 'down',
        change: -0.05,
      },
    ]);

    // Simulate API endpoint metrics
    setApiEndpoints([
      {
        path: '/api/v1/loans',
        method: 'GET',
        avgResponseTime: 145,
        successRate: 99.2,
        requestsLastHour: 1247,
        errorsLastHour: 10,
      },
      {
        path: '/api/v1/loans',
        method: 'POST',
        avgResponseTime: 234,
        successRate: 98.5,
        requestsLastHour: 342,
        errorsLastHour: 5,
      },
      {
        path: '/api/v1/borrowers',
        method: 'GET',
        avgResponseTime: 89,
        successRate: 99.8,
        requestsLastHour: 2156,
        errorsLastHour: 4,
      },
      {
        path: '/api/v1/mpesa/callback',
        method: 'POST',
        avgResponseTime: 67,
        successRate: 100,
        requestsLastHour: 89,
        errorsLastHour: 0,
      },
      {
        path: '/api/v1/audit-log',
        method: 'GET',
        avgResponseTime: 312,
        successRate: 97.3,
        requestsLastHour: 156,
        errorsLastHour: 4,
      },
    ]);

    // Simulate error logs
    setErrorLogs([
      {
        id: '1',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        endpoint: '/api/v1/loans',
        stack: 'Error: Connection timeout\n  at Database.query (db.js:45)\n  at LoanController.getAll (loan.js:23)',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'warning',
        message: 'Slow query detected (>500ms)',
        endpoint: '/api/v1/audit-log',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'error',
        message: 'M-Pesa callback validation failed',
        endpoint: '/api/v1/mpesa/callback',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'info',
        message: 'Cache cleared successfully',
      },
    ]);

    setLastUpdated(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600 mt-1">
            System health, API metrics, and error tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              autoRefresh
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={loadMetrics}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className={`rounded-lg border-2 p-4 ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium">{metric.name}</h3>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs">
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                <span className="text-lg text-gray-500">{metric.unit}</span>
              </div>
              <div className="text-xs opacity-75 capitalize">{metric.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Requests (1h)</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Errors (1h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apiEndpoints.map((endpoint, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{endpoint.path}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={endpoint.avgResponseTime > 300 ? 'text-red-600 font-medium' : ''}>
                      {endpoint.avgResponseTime}ms
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={endpoint.successRate < 99 ? 'text-yellow-600 font-medium' : 'text-green-600'}>
                      {endpoint.successRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{endpoint.requestsLastHour.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={endpoint.errorsLastHour > 0 ? 'text-red-600 font-medium' : ''}>
                      {endpoint.errorsLastHour}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h2>
        <div className="space-y-3">
          {errorLogs.map((log) => (
            <div
              key={log.id}
              className={`rounded-lg border p-4 ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {log.level === 'error' && <AlertTriangle className="h-4 w-4" />}
                  {log.level === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {log.level === 'info' && <CheckCircle className="h-4 w-4" />}
                  <span className="text-xs font-medium uppercase">{log.level}</span>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium mb-1">{log.message}</p>
              {log.endpoint && (
                <p className="text-xs opacity-75 font-mono">{log.endpoint}</p>
              )}
              {log.stack && (
                <pre className="mt-2 text-xs opacity-75 font-mono overflow-x-auto">
                  {log.stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Health Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">System Health: Excellent</h3>
            <p className="text-sm text-green-800">
              All systems operational. No critical issues detected. Last incident: 7 days ago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
