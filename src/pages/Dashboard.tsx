import { useDB } from '../contexts/DataContext';
import { calculatePAR } from '../db/services';
import type { Loan } from '../db/schema';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Users, FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const disbursementData = [
  { month: 'Sep', disbursed: 28_500_000, collected: 22_100_000 },
  { month: 'Oct', disbursed: 32_000_000, collected: 25_800_000 },
  { month: 'Nov', disbursed: 35_200_000, collected: 28_400_000 },
  { month: 'Dec', disbursed: 38_700_000, collected: 30_200_000 },
  { month: 'Jan', disbursed: 42_100_000, collected: 33_500_000 },
  { month: 'Feb', disbursed: 45_800_000, collected: 32_450_000 },
];

function StatCard({ title, value, change, changeType, icon: Icon }: { title: string; value: string; change?: string; changeType?: 'up' | 'down'; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-emerald-600" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${changeType === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
          <TrendingUp size={12} />
          {change}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { db, loading } = useDB();

  if (loading || !db) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const loans = db.loans as Loan[];
  const par = calculatePAR(db);
  
  const totalDisbursed = loans.filter(l => l.disbursedAt).reduce((s, l) => s + l.principal, 0);
  const totalCollected = loans.reduce((s, l) => s + l.amountPaid, 0);
  const activeLoans = loans.filter(l => ['active', 'overdue', 'disbursed'].includes(l.status)).length;
  const newApplications = loans.filter(l => {
    const applied = new Date(l.appliedAt).getTime();
    return Date.now() - applied < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const approvalRate = loans.length > 0 
    ? ((loans.filter(l => ['approved', 'active', 'overdue', 'disbursed', 'completed'].includes(l.status)).length / loans.length) * 100).toFixed(1)
    : '0';
  const unresolvedAlerts = db.alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Live data from database • {db.tenants[0]?.name} • Tier: {db.tenants[0]?.tier}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/database" className="text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-medium">
            Open Backend Console →
          </Link>
        </div>
      </div>

      {/* Database Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Database Connected</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300">{db.auditLog.length} audit entries</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300">{db.loans.length} loans</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300">{db.mpesaTransactions.length} M-Pesa txns</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Hash chain: ✓</span>
            <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">7yr retention</span>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Multi-tenant</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Disbursed" value={`KES ${(totalDisbursed / 1000000).toFixed(1)}M`} change="+8.7% vs last month" changeType="up" icon={DollarSign} />
        <StatCard title="Total Collected" value={`KES ${(totalCollected / 1000000).toFixed(1)}M`} change="+12.3% vs last month" changeType="up" icon={TrendingUp} />
        <StatCard title="Active Loans" value={activeLoans.toString()} change={`${loans.length} total`} changeType="up" icon={FileText} />
        <StatCard title="New Applications" value={newApplications.toString()} change="Last 7 days" changeType="up" icon={Users} />
      </div>

      {/* PAR & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Portfolio at Risk (Live)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">PAR 30</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${par.par30 > 7 ? 'text-red-600' : 'text-amber-600'}`}>{par.par30.toFixed(1)}%</span>
                {par.par30 > 7 && <span className="text-xs text-red-500">⚠ Above threshold</span>}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${par.par30 > 7 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(par.par30 * 5, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">PAR 60</span>
              <span className="text-lg font-bold text-orange-600">{par.par60.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(par.par60 * 5, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">PAR 90</span>
              <span className="text-lg font-bold text-red-600">{par.par90.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(par.par90 * 5, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Disbursement & Collection Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={disbursementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v/1000000}M`} />
              <Tooltip formatter={(value: number) => [`KES ${(value/1000000).toFixed(1)}M`, '']} />
              <Area type="monotone" dataKey="disbursed" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              <Area type="monotone" dataKey="collected" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Approval Rate</div>
              <div className="text-xl font-bold text-gray-900">{approvalRate}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">In Duplum Reached</div>
              <div className="text-xl font-bold text-orange-600">{loans.filter(l => l.inDuplumReached).length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Cooling-Off Active</div>
              <div className="text-xl font-bold text-blue-600">{loans.filter(l => l.status === 'cooling_off').length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Consents Granted</div>
              <div className="text-xl font-bold text-emerald-600">{db.consents.filter((c: any) => c.granted).length}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Recent Loans</h3>
            <Link to="/app/loans" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {loans.slice(0, 6).map((loan) => (
              <div key={loan.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {db.borrowers.find((b: any) => b.id === loan.borrowerId)?.firstName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {db.borrowers.find((b: any) => b.id === loan.borrowerId)?.firstName} {db.borrowers.find((b: any) => b.id === loan.borrowerId)?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">KES {loan.principal.toLocaleString()} • {loan.id}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                  loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  loan.status === 'cooling_off' ? 'bg-purple-100 text-purple-700' :
                  loan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {loan.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Compliance Alerts (Live from DB)</h3>
          <Link to="/app/compliance" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {unresolvedAlerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="px-5 py-3 flex items-start gap-3">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                alert.severity === 'critical' ? 'bg-red-100' :
                alert.severity === 'high' ? 'bg-orange-100' :
                alert.severity === 'medium' ? 'bg-amber-100' :
                'bg-blue-100'
              }`}>
                {alert.severity === 'critical' || alert.severity === 'high' ? 
                  <AlertTriangle size={12} className={alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'} /> :
                  alert.severity === 'medium' ? <Clock size={12} className="text-amber-600" /> :
                  <CheckCircle size={12} className="text-blue-600" />
                }
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                <div className="text-xs text-gray-500 truncate">{alert.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
