import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { Shield, AlertTriangle, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'velocity' | 'identity' | 'pattern' | 'location' | 'device' | 'amount';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  borrowerId: string;
  borrowerName: string;
  loanId?: string;
  riskScore: number;
  indicators: string[];
  status: 'pending' | 'investigating' | 'confirmed' | 'false_positive';
  createdAt: string;
  investigatedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export default function FraudDetection() {
  const { db, mutate, audit } = useDB();
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Mock fraud alerts
  const [alerts, setAlerts] = useState<FraudAlert[]>([
    {
      id: 'FRD-001',
      type: 'velocity',
      severity: 'high',
      title: 'Multiple applications from same device',
      description: '5 loan applications submitted from device ID DEV-12345 within 2 hours',
      borrowerId: 'BR-005',
      borrowerName: 'David Kamau',
      riskScore: 85,
      indicators: [
        '5 applications in 2 hours',
        'Same device fingerprint',
        'Different phone numbers',
        'Similar IP addresses',
      ],
      status: 'investigating',
      createdAt: '2026-02-19T10:30:00Z',
      investigatedBy: 'U-SARAH',
    },
    {
      id: 'FRD-002',
      type: 'identity',
      severity: 'critical',
      title: 'ID number mismatch',
      description: 'National ID number does not match CRB records',
      borrowerId: 'BR-006',
      borrowerName: 'Faith Njeri',
      loanId: 'LN-006',
      riskScore: 92,
      indicators: [
        'ID number not found in CRB',
        'Name mismatch',
        'Photo verification failed',
      ],
      status: 'pending',
      createdAt: '2026-02-19T11:45:00Z',
    },
    {
      id: 'FRD-003',
      type: 'pattern',
      severity: 'medium',
      title: 'Unusual borrowing pattern',
      description: 'Borrower has taken 8 loans in last 3 months with increasing amounts',
      borrowerId: 'BR-007',
      borrowerName: 'Samuel Kipchoge',
      riskScore: 68,
      indicators: [
        '8 loans in 3 months',
        'Increasing loan amounts',
        'Short repayment cycles',
        'High debt-to-income ratio',
      ],
      status: 'pending',
      createdAt: '2026-02-19T09:15:00Z',
    },
    {
      id: 'FRD-004',
      type: 'location',
      severity: 'low',
      title: 'Geographic anomaly',
      description: 'Application from unusual location for this borrower',
      borrowerId: 'BR-008',
      borrowerName: 'Lucy Muthoni',
      riskScore: 45,
      indicators: [
        'Application from different city',
        'First time from this location',
        'IP address mismatch',
      ],
      status: 'false_positive',
      createdAt: '2026-02-18T14:20:00Z',
      investigatedBy: 'U-SARAH',
      resolvedAt: '2026-02-18T16:00:00Z',
      resolution: 'Borrower traveling for work. Verified via phone call.',
    },
    {
      id: 'FRD-005',
      type: 'amount',
      severity: 'high',
      title: 'Suspicious loan amount request',
      description: 'Requesting maximum amount immediately after registration',
      borrowerId: 'BR-009',
      borrowerName: 'Robert Kariuki',
      loanId: 'LN-009',
      riskScore: 78,
      indicators: [
        'New borrower (< 24 hours)',
        'Requesting max amount (KES 50,000)',
        'No credit history',
        'Incomplete KYC',
      ],
      status: 'pending',
      createdAt: '2026-02-19T13:00:00Z',
    },
  ]);

  const handleUpdateStatus = (alertId: string, status: FraudAlert['status'], resolution?: string) => {
    setAlerts(alerts.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status,
          investigatedBy: 'U-ADMIN',
          resolvedAt: status === 'confirmed' || status === 'false_positive' ? new Date().toISOString() : undefined,
          resolution,
        };
      }
      return alert;
    }));

    setSelectedAlert(null);
    audit('FRAUD_ALERT_UPDATED', 'FraudAlert', alertId, `Status: ${status}${resolution ? `, Resolution: ${resolution}` : ''}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'investigating': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-red-50 text-red-700 border-red-200';
      case 'false_positive': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'velocity': return '⚡';
      case 'identity': return '🆔';
      case 'pattern': return '📊';
      case 'location': return '📍';
      case 'device': return '📱';
      case 'amount': return '💰';
      default: return '⚠️';
    }
  };

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filterSeverity);

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    pending: alerts.filter(a => a.status === 'pending').length,
    confirmed: alerts.filter(a => a.status === 'confirmed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Detection</h1>
        <p className="text-gray-600 mt-1">
          Monitor and investigate suspicious activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">Total Alerts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Critical</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-gray-600">High</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.confirmed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter by severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No fraud alerts found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                      <p className="text-xs text-gray-500">{alert.id} • {alert.borrowerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(alert.status)}`}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Risk Score: <strong className={alert.riskScore >= 80 ? 'text-red-600' : alert.riskScore >= 60 ? 'text-orange-600' : 'text-yellow-600'}>{alert.riskScore}/100</strong></span>
                    <span>Indicators: {alert.indicators.length}</span>
                    <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {alert.indicators.slice(0, 3).map((indicator, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {indicator}
                      </span>
                    ))}
                    {alert.indicators.length > 3 && (
                      <span className="text-xs text-gray-500">+{alert.indicators.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{getTypeIcon(selectedAlert.type)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAlert.title}</h2>
                    <p className="text-sm text-gray-500">{selectedAlert.id} • {selectedAlert.borrowerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedAlert.status)}`}>
                  {selectedAlert.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">
                  Risk Score: <strong className={selectedAlert.riskScore >= 80 ? 'text-red-600' : selectedAlert.riskScore >= 60 ? 'text-orange-600' : 'text-yellow-600'}>{selectedAlert.riskScore}/100</strong>
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700">{selectedAlert.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Risk Indicators</h3>
                <ul className="space-y-2">
                  {selectedAlert.indicators.map((indicator, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedAlert.status === 'confirmed' && selectedAlert.resolution && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">Resolution</h3>
                  <p className="text-sm text-red-800">{selectedAlert.resolution}</p>
                  <p className="text-xs text-red-700 mt-2">
                    Resolved by {selectedAlert.investigatedBy} on {new Date(selectedAlert.resolvedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedAlert.status === 'false_positive' && selectedAlert.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Resolution</h3>
                  <p className="text-sm text-green-800">{selectedAlert.resolution}</p>
                  <p className="text-xs text-green-700 mt-2">
                    Marked as false positive by {selectedAlert.investigatedBy} on {new Date(selectedAlert.resolvedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              {(selectedAlert.status === 'pending' || selectedAlert.status === 'investigating') && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'investigating')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Start Investigation
                  </button>
                  <button
                    onClick={() => {
                      const resolution = prompt('Resolution notes:');
                      if (resolution) handleUpdateStatus(selectedAlert.id, 'confirmed', resolution);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Confirm Fraud
                  </button>
                  <button
                    onClick={() => {
                      const resolution = prompt('Why is this a false positive?');
                      if (resolution) handleUpdateStatus(selectedAlert.id, 'false_positive', resolution);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Mark as False Positive
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
