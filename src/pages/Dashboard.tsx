import { dashboardStats, disbursementData, parData, loans, complianceAlerts } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, DollarSign, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const formatCurrency = (value: number) => `KES ${(value / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back. Here's your lending portfolio overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Disbursed" value={formatCurrency(dashboardStats.totalDisbursed)} change="+8.7% vs last month" changeType="up" icon={DollarSign} />
        <StatCard title="Total Collected" value={formatCurrency(dashboardStats.totalCollected)} change="+12.3% vs last month" changeType="up" icon={TrendingUp} />
        <StatCard title="Active Loans" value={dashboardStats.activeLoans.toLocaleString()} change="+45 this week" changeType="up" icon={FileText} />
        <StatCard title="New Applications" value={dashboardStats.newApplications.toString()} change="Today" changeType="up" icon={Users} />
      </div>

      {/* PAR & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Portfolio at Risk</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">PAR 30</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-amber-600">{dashboardStats.portfolioAtRisk30}%</span>
                <span className="text-xs text-red-500">↑ 0.4%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${dashboardStats.portfolioAtRisk30 * 5}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">PAR 60</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-orange-600">{dashboardStats.portfolioAtRisk60}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${dashboardStats.portfolioAtRisk60 * 5}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">PAR 90</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">{dashboardStats.portfolioAtRisk90}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${dashboardStats.portfolioAtRisk90 * 5}%` }} />
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">PAR Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={parData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip />
              <Bar dataKey="par30" fill="#f59e0b" name="PAR 30" radius={[2, 2, 0, 0]} />
              <Bar dataKey="par60" fill="#f97316" name="PAR 60" radius={[2, 2, 0, 0]} />
              <Bar dataKey="par90" fill="#ef4444" name="PAR 90" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Approval Rate</div>
              <div className="text-xl font-bold text-gray-900">{dashboardStats.approvalRate}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Avg Processing</div>
              <div className="text-xl font-bold text-gray-900">{dashboardStats.avgProcessingTime}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Collections Recovery</div>
              <div className="text-xl font-bold text-gray-900">KES {(dashboardStats.collectionsRecovered / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Active Products</div>
              <div className="text-xl font-bold text-gray-900">3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Loans */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Recent Loans</h3>
            <Link to="/app/loans" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loans.slice(0, 5).map((loan) => (
              <div key={loan.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {loan.borrowerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                    <div className="text-xs text-gray-500">KES {loan.principal.toLocaleString()} • {loan.productName}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                  loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {loan.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Compliance Alerts</h3>
            <Link to="/app/compliance" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {complianceAlerts.filter(a => !a.resolved).map((alert) => (
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
    </div>
  );
}
