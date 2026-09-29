import { integrations } from '../data/mockData';
import { CheckCircle, XCircle, AlertCircle, Clock, RefreshCw, Settings, ExternalLink } from 'lucide-react';

export default function Integrations() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} className="text-green-500" />;
      case 'disconnected': return <XCircle size={16} className="text-gray-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700';
      case 'disconnected': return 'bg-gray-100 text-gray-600';
      case 'error': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return '';
    }
  };

  const categoryGroups = {
    payment: integrations.filter(i => i.category === 'payment'),
    sms: integrations.filter(i => i.category === 'sms'),
    email: integrations.filter(i => i.category === 'email'),
    kyc: integrations.filter(i => i.category === 'kyc'),
    crb: integrations.filter(i => i.category === 'crb'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations Hub</h1>
          <p className="text-sm text-gray-500">Manage connections to M-Pesa, CRBs, KYC providers, and more</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          <ExternalLink size={16} /> Add Integration
        </button>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Connected', count: integrations.filter(i => i.status === 'connected').length, color: 'text-green-600 bg-green-50' },
          { label: 'Disconnected', count: integrations.filter(i => i.status === 'disconnected').length, color: 'text-gray-600 bg-gray-50' },
          { label: 'Error', count: integrations.filter(i => i.status === 'error').length, color: 'text-red-600 bg-red-50' },
          { label: 'Pending', count: integrations.filter(i => i.status === 'pending').length, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total', count: integrations.length, color: 'text-blue-600 bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl p-4 ${stat.color}`}>
            <div className="text-xs opacity-70">{stat.label}</div>
            <div className="text-2xl font-bold">{stat.count}</div>
          </div>
        ))}
      </div>

      {/* M-Pesa Section - Featured */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">M-Pesa Daraja API</h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Connected</span>
            </div>
            <p className="text-sm text-gray-600">Direct Safaricom integration — no aggregator. C2B, B2C, and STK Push active.</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/50 text-gray-500">
            <Settings size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-xs text-gray-500 mb-1">C2B (Repayments)</div>
            <div className="text-sm font-semibold text-gray-900">Paybill: 247247</div>
            <div className="text-xs text-green-600 mt-1">Auto-reconciliation active</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-xs text-gray-500 mb-1">B2C (Disbursements)</div>
            <div className="text-sm font-semibold text-gray-900">Avg: 3m 42s</div>
            <div className="text-xs text-green-600 mt-1">Success rate: 98.7%</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-xs text-gray-500 mb-1">STK Push</div>
            <div className="text-sm font-semibold text-gray-900">Active</div>
            <div className="text-xs text-green-600 mt-1">1,247 pushes this month</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span>Environment: <strong className="text-gray-700">Production</strong></span>
          <span>Last callback: <strong className="text-gray-700">2 min ago</strong></span>
          <span>Webhook: <strong className="text-green-600">Verified</strong></span>
        </div>
      </div>

      {/* Other Integrations by Category */}
      <div className="space-y-4">
        {Object.entries(categoryGroups).filter(([_, items]) => items.length > 0).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 capitalize">{category === 'crb' ? 'Credit Reference Bureaus' : category === 'kyc' ? 'KYC Verification' : category === 'sms' ? 'SMS Gateway' : category === 'email' ? 'Email Service' : category}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((integration) => (
                <div key={integration.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{integration.name}</div>
                      <div className="text-xs text-gray-500">{integration.details}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(integration.status)}`}>
                      {integration.status}
                    </span>
                    {integration.lastSync && (
                      <span className="text-xs text-gray-400">
                        Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                      </span>
                    )}
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <RefreshCw size={14} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Access */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">REST API Access</h3>
            <p className="text-sm text-gray-500">Embed lending into your existing applications</p>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Growth Tier+</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Base URL</div>
            <code className="text-xs text-gray-800 font-mono">https://api.lendingos.co.ke/v1</code>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Rate Limit</div>
            <div className="text-sm font-medium text-gray-900">1,000 req/min</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Webhooks</div>
            <div className="text-sm font-medium text-green-600">Active (3 endpoints)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
