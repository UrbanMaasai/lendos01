import { disbursementData, parData, applicationFunnel } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

const loanStatusData = [
  { name: 'Active', value: 682 },
  { name: 'Overdue', value: 156 },
  { name: 'Completed', value: 389 },
  { name: 'Defaulted', value: 20 },
];

const rollRateData = [
  { from: 'Current', to30: 8.2, to60: 1.1, to90: 0.3 },
  { from: '1-30 DPD', to30: 0, to60: 22.5, to90: 4.2 },
  { from: '31-60 DPD', to30: 0, to60: 0, to90: 35.8 },
  { from: '61-90 DPD', to30: 0, to60: 0, to90: 52.1 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Portfolio performance, risk metrics, and regulatory reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <option>Last 6 months</option>
            <option>Last 3 months</option>
            <option>Last 12 months</option>
            <option>Year to date</option>
          </select>
          <button className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Total Portfolio</div>
          <div className="text-xl font-bold text-gray-900">KES 45.8M</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><TrendingUp size={10} /> +8.7%</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Collection Rate</div>
          <div className="text-xl font-bold text-gray-900">70.8%</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><TrendingUp size={10} /> +2.1%</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Write-off Rate</div>
          <div className="text-xl font-bold text-gray-900">1.6%</div>
          <div className="text-xs text-red-600 flex items-center gap-1 mt-1"><TrendingUp size={10} /> +0.3%</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Net Interest Margin</div>
          <div className="text-xl font-bold text-gray-900">18.4%</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><TrendingUp size={10} /> +1.2%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Disbursement & Collection */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Disbursement & Collection Trend</h3>
            <Calendar size={16} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={disbursementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v/1000000}M`} />
              <Tooltip formatter={(value: number) => [`KES ${(value/1000000).toFixed(1)}M`, '']} />
              <Area type="monotone" dataKey="disbursed" stroke="#10b981" fill="#d1fae5" strokeWidth={2} name="Disbursed" />
              <Area type="monotone" dataKey="collected" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Status Distribution */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Portfolio Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={loanStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {loanStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {loanStatusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAR Trend */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Portfolio at Risk Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
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

        {/* Application Funnel */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Application Funnel</h3>
          <div className="space-y-2">
            {applicationFunnel.map((stage, i) => {
              const maxCount = applicationFunnel[0].count;
              const width = (stage.count / maxCount) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-gray-600 text-right shrink-0">{stage.stage}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-xs text-white font-medium">{stage.count}</span>
                    </div>
                  </div>
                  <div className="w-12 text-xs text-gray-500 text-right">
                    {((stage.count / maxCount) * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roll Rate Analysis */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Roll Rate Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">From Bucket</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">→ Current</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">→ 1-30 DPD</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">→ 31-60 DPD</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">→ 61-90 DPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rollRateData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.from}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{row.to30}%</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{row.to60}%</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{row.to90}%</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Reports */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Regulatory Report Exports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'CBK Monthly Return', due: 'Due: 15th of month', status: 'Ready' },
            { name: 'ODPC Data Processing Report', due: 'Due: Quarterly', status: 'Ready' },
            { name: 'DLAK Conduct Self-Assessment', due: 'Due: Quarterly', status: 'In Progress' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">{report.name}</div>
                <div className="text-xs text-gray-500">{report.due}</div>
              </div>
              <button className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium hover:bg-emerald-200">
                {report.status}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
