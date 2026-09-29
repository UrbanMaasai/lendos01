import { useState } from 'react';
import { useDB } from '../../contexts/DataContext';
import { FileText, Download, Calendar, CheckCircle, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

export default function ComplianceReports() {
  const { db, loading } = useDB();
  const [selectedReport, setSelectedReport] = useState<string>('cbk-monthly');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-02-19' });

  if (loading || !db) {
    return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const reports = [
    {
      id: 'cbk-monthly',
      name: 'CBK Monthly Return',
      description: 'Central Bank of Kenya monthly regulatory filing',
      frequency: 'Monthly',
      dueDate: '15th of each month',
      status: 'ready',
      icon: FileText,
    },
    {
      id: 'odpc-quarterly',
      name: 'ODPC Data Protection Report',
      description: 'Office of Data Protection Commissioner quarterly report',
      frequency: 'Quarterly',
      dueDate: 'End of quarter + 30 days',
      status: 'ready',
      icon: CheckCircle,
    },
    {
      id: 'dlak-conduct',
      name: 'DLAK Code of Conduct Assessment',
      description: 'Digital Lenders Association of Kenya self-assessment',
      frequency: 'Quarterly',
      dueDate: 'End of quarter + 15 days',
      status: 'in-progress',
      icon: AlertTriangle,
    },
    {
      id: 'par-analysis',
      name: 'Portfolio at Risk Analysis',
      description: 'Detailed PAR breakdown by product, vintage, and region',
      frequency: 'Weekly',
      dueDate: 'Every Monday',
      status: 'ready',
      icon: TrendingUp,
    },
    {
      id: 'audit-summary',
      name: 'Audit Log Summary',
      description: 'Comprehensive audit trail for regulatory review',
      frequency: 'On-demand',
      dueDate: 'N/A',
      status: 'ready',
      icon: BarChart3,
    },
  ];

  // Mock report data
  const reportData = {
    'cbk-monthly': {
      sections: [
        { title: 'Loan Portfolio Summary', items: [
          { label: 'Total Active Loans', value: db.loans.filter((l: any) => ['active', 'overdue'].includes(l.status)).length },
          { label: 'Total Disbursed (KES)', value: db.loans.filter((l: any) => l.disbursedAt).reduce((sum: number, l: any) => sum + l.principal, 0).toLocaleString() },
          { label: 'Total Outstanding (KES)', value: db.loans.reduce((sum: number, l: any) => sum + l.balance, 0).toLocaleString() },
          { label: 'Average Loan Size (KES)', value: Math.round(db.loans.reduce((sum: number, l: any) => sum + l.principal, 0) / db.loans.length).toLocaleString() },
        ]},
        { title: 'Delinquency Metrics', items: [
          { label: 'PAR 30 (%)', value: ((db.loans.filter((l: any) => l.daysPastDue >= 1).length / db.loans.length) * 100).toFixed(2) },
          { label: 'PAR 60 (%)', value: ((db.loans.filter((l: any) => l.daysPastDue >= 31).length / db.loans.length) * 100).toFixed(2) },
          { label: 'PAR 90 (%)', value: ((db.loans.filter((l: any) => l.daysPastDue >= 61).length / db.loans.length) * 100).toFixed(2) },
          { label: 'Write-off Rate (%)', value: ((db.loans.filter((l: any) => l.status === 'defaulted').length / db.loans.length) * 100).toFixed(2) },
        ]},
        { title: 'Compliance Metrics', items: [
          { label: 'In Duplum Cases', value: db.loans.filter((l: any) => l.inDuplumReached).length },
          { label: 'Cooling-Off Violations', value: 0 },
          { label: 'Consent Withdrawals', value: db.consents.filter((c: any) => c.withdrawnAt).length },
          { label: 'Complaints Received', value: db.complaints.length },
        ]},
      ],
    },
  };

  const currentReport = reportData[selectedReport as keyof typeof reportData];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="text-sm text-gray-500">Generate and export regulatory reports</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedReport === report.id
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <report.icon size={20} className={selectedReport === report.id ? 'text-emerald-600' : 'text-gray-400'} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                report.status === 'ready' ? 'bg-green-100 text-green-700' :
                report.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {report.status}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{report.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar size={12} />
              <span>{report.frequency} • Due: {report.dueDate}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Report Preview */}
      {currentReport && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="font-semibold text-gray-900">Report Preview</h3>
              <p className="text-xs text-gray-500">Period: {dateRange.start} to {dateRange.end}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {currentReport.sections.map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{section.title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {section.items.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Generated on {new Date().toLocaleString()} • Tenant: {db.tenants[0]?.name}
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                Export CSV
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                Export JSON
              </button>
              <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: 'CBK Monthly Return - January 2026', date: '2026-02-15', status: 'submitted', size: '2.4 MB' },
            { name: 'ODPC Data Protection Report - Q4 2025', date: '2026-01-30', status: 'submitted', size: '1.8 MB' },
            { name: 'DLAK Conduct Assessment - Q4 2025', date: '2026-01-20', status: 'submitted', size: '3.1 MB' },
            { name: 'Portfolio at Risk Analysis - Week 6', date: '2026-02-10', status: 'generated', size: '856 KB' },
          ].map((report, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{report.name}</div>
                  <div className="text-xs text-gray-500">{report.date} • {report.size}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  report.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {report.status}
                </span>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
