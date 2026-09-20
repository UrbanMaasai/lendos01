import { useState } from 'react';
import { auditEntries, complianceAlerts } from '../data/mockData';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Eye, Download, Lock, Hash } from 'lucide-react';

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'audit' | 'conduct' | 'consent'>('alerts');

  const unresolvedAlerts = complianceAlerts.filter(a => !a.resolved);
  const resolvedAlerts = complianceAlerts.filter(a => a.resolved);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance & Audit</h1>
          <p className="text-sm text-gray-500">Tamper-evident audit logs, conduct monitoring, and regulatory compliance</p>
        </div>
        <button className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} /> Export Audit Log
        </button>
      </div>

      {/* Compliance Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <span className="text-xs text-gray-500">Active Alerts</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{unresolvedAlerts.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Hard-Blocks</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-xs text-green-600">All active</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Audit Entries</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">12,847</div>
          <div className="text-xs text-gray-500">7-year retention</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { id: 'alerts', label: 'Compliance Alerts' },
          { id: 'audit', label: 'Audit Log' },
          { id: 'conduct', label: 'Conduct Rules' },
          { id: 'consent', label: 'Consent Management' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {complianceAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-xl p-4 border ${
              alert.resolved ? 'border-gray-200 opacity-60' :
              alert.severity === 'critical' ? 'border-red-200 bg-red-50/50' :
              alert.severity === 'high' ? 'border-orange-200 bg-orange-50/50' :
              alert.severity === 'medium' ? 'border-amber-200 bg-amber-50/50' :
              'border-blue-200 bg-blue-50/50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.severity === 'critical' ? 'bg-red-100' :
                    alert.severity === 'high' ? 'bg-orange-100' :
                    alert.severity === 'medium' ? 'bg-amber-100' :
                    'bg-blue-100'
                  }`}>
                    {alert.severity === 'critical' || alert.severity === 'high' ? 
                      <AlertTriangle size={16} className={alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'} /> :
                      <Clock size={16} className={alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'} />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Resolved</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!alert.resolved && (
                  <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">Tamper-evident • Hash-chained • 7-year retention</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Timestamp</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Action</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Details</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-900 font-mono">{entry.user}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        entry.action.includes('BLOCK') || entry.action.includes('DUPLUM') ? 'bg-red-100 text-red-700' :
                        entry.action.includes('CONSENT') ? 'bg-blue-100 text-blue-700' :
                        entry.action.includes('APPROVED') || entry.action.includes('DISBURSED') ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{entry.details}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{entry.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'conduct' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-green-600" />
              <h3 className="font-semibold text-green-900">DLAK Code of Conduct — All Controls Active</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { code: 'CL-005', rule: 'No contact list access', status: 'Enforced' },
                { code: 'CL-006', rule: 'No third-party messaging', status: 'Enforced' },
                { code: 'CL-007', rule: 'No social media shaming', status: 'Enforced' },
                { code: 'CL-008', rule: 'No threats/obscene language', status: 'Enforced' },
                { code: 'CL-009', rule: 'All communications logged', status: 'Active' },
                { code: 'CL-010', rule: 'Auto-escalation on complaints', status: 'Monitoring' },
              ].map((rule, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{rule.code}</span>
                    <span className="text-sm text-gray-700">{rule.rule}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle size={12} /> {rule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Contact Frequency Rules</h3>
            <div className="space-y-2">
              {[
                'Max 3 contacts per borrower per day (all channels combined)',
                'Permitted hours: 07:00 - 20:00 local time only',
                'No contact on Sundays or public holidays (unless explicit consent)',
                'After Promise-to-Pay: 48-hour cooling-off before automated chasing',
                'Open complaint: suppress automated collections until resolved',
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consent' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Consent Management (Data Protection Act 2019)</h3>
            <p className="text-sm text-gray-600 mb-4">All borrower consent is granular, timestamped, informed, and withdrawable.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'Credit Check', description: 'Permission to pull CRB report', required: true },
                { type: 'CRB Reporting', description: 'Permission to report to credit bureau', required: false },
                { type: 'Marketing', description: 'Permission to send promotional messages', required: false },
                { type: 'Data Processing', description: 'Permission to process personal data', required: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.type}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.required && <span className="text-xs text-red-600">Required</span>}
                    <div className={`w-8 h-5 rounded-full flex items-center ${item.required ? 'bg-emerald-500' : 'bg-gray-300'} p-0.5`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.required ? 'translate-x-3' : ''}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Key principle:</strong> No pre-ticked boxes. Consent must be explicit, informed, and freely given. 
                Borrowers can withdraw consent at any time via their app.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Consent Activity</h3>
            <div className="space-y-2">
              {[
                { borrower: 'Grace A.', action: 'Withdrew marketing consent', time: '2 hours ago' },
                { borrower: 'James M.', action: 'Granted all consent items', time: '5 hours ago' },
                { borrower: 'Peter O.', action: 'Withdrew CRB reporting consent', time: '1 day ago' },
                { borrower: 'Mary W.', action: 'Updated consent version (v2.1)', time: '2 days ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {item.borrower[0]}
                    </div>
                    <div>
                      <span className="text-sm text-gray-900">{item.borrower}</span>
                      <span className="text-sm text-gray-500 ml-2">{item.action}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
