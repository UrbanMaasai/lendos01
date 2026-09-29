import { useState } from 'react';
import { useDB } from '../../contexts/DataContext';
import { Building2, Users, DollarSign, Activity, TrendingUp, AlertTriangle, CheckCircle, Settings, Eye } from 'lucide-react';
import type { Tenant } from '../../db/schema';

export default function TenantManagement() {
  const { db, loading, mutate } = useDB();
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading || !db) {
    return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const tenants = db.tenants as Tenant[];

  // Mock data for demonstration
  const tenantMetrics = tenants.map(t => ({
    ...t,
    totalLoans: db.loans.filter((l: any) => l.tenantId === t.id).length,
    totalDisbursed: db.loans.filter((l: any) => l.tenantId === t.id && l.disbursedAt).reduce((sum: number, l: any) => sum + l.principal, 0),
    totalCollected: db.loans.filter((l: any) => l.tenantId === t.id).reduce((sum: number, l: any) => sum + l.amountPaid, 0),
    activeUsers: db.users.filter((u: any) => u.tenantId === t.id && u.status === 'active').length,
    complianceAlerts: db.alerts.filter((a: any) => a.tenantId === t.id && !a.resolved).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-sm text-gray-500">Platform admin view • {tenants.length} tenants</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Building2 size={16} /> Add Tenant
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Total Tenants</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{tenants.length}</div>
          <div className="text-xs text-emerald-600 mt-1">+2 this month</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-600" />
            </div>
            <span className="text-xs text-gray-500">Total Disbursed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            KES {(tenantMetrics.reduce((sum, t) => sum + t.totalDisbursed, 0) / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {tenantMetrics.reduce((sum, t) => sum + t.activeUsers, 0)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-gray-500">Open Alerts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {tenantMetrics.reduce((sum, t) => sum + t.complianceAlerts, 0)}
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">All Tenants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Loans</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Disbursed</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Users</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Alerts</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenantMetrics.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: tenant.primaryColor }}>
                        {tenant.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-xs text-gray-500">{tenant.subdomain}.lendingos.co.ke</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      tenant.tier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                      tenant.tier === 'growth' ? 'bg-emerald-100 text-emerald-700' :
                      tenant.tier === 'starter' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tenant.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {tenant.totalLoans} / {tenant.maxLoans}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    KES {(tenant.totalDisbursed / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {tenant.activeUsers}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                      tenant.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tenant.complianceAlerts > 0 ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {tenant.complianceAlerts}
                      </span>
                    ) : (
                      <CheckCircle size={16} className="text-green-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <Settings size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Tenant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input type="text" placeholder="e.g. Mika Lenders Ltd" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                <div className="flex items-center">
                  <input type="text" placeholder="mika" className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm" />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500">.lendingos.co.ke</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="free">Free (KES 0/mo)</option>
                  <option value="starter">Starter (KES 9,500/mo)</option>
                  <option value="growth">Growth (KES 35,000/mo)</option>
                  <option value="enterprise">Enterprise (KES 150,000+/mo)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DCP License Number</label>
                <input type="text" placeholder="DCP/2026/XXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                Create Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
