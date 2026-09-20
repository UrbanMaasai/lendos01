import { useState } from 'react';
import { loans } from '../data/mockData';
import { Search, Filter, Download, Eye, AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react';

export default function Loans() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoans = loans.filter(loan => {
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    active: loans.filter(l => l.status === 'active').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
    completed: loans.filter(l => l.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-sm text-gray-500">Manage and monitor all loan applications and active loans</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Compliance Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Shield size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Compliance Controls Active</p>
          <p className="text-xs text-blue-700 mt-0.5">In duplum rule enforced • KFS required • Cooling-off periods active • Consent verified</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Loan ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Borrower</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Principal</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Compliance</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-gray-900">{loan.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                    <div className="text-xs text-gray-500">{loan.borrowerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{loan.productName}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-gray-900">KES {loan.principal.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${loan.balance > 0 ? 'text-gray-900' : 'text-green-600'}`}>
                      KES {loan.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                      loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      loan.status === 'disbursed' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {loan.status === 'overdue' && <AlertTriangle size={10} />}
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {loan.inDuplumReached && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded" title="In duplum reached">
                          2×
                        </span>
                      )}
                      {loan.coolingOffEndsAt && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded" title="Cooling-off active">
                          <Clock size={10} className="inline" />
                        </span>
                      )}
                      {loan.kfsAccepted && <span title="KFS accepted"><CheckCircle size={14} className="text-green-500" /></span>}
                      {loan.consentGiven && <span title="Consent given"><Shield size={14} className="text-blue-500" /></span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500">Total Disbursed</div>
          <div className="text-lg font-bold text-gray-900 mt-1">
            KES {loans.filter(l => l.disbursedAt).reduce((sum, l) => sum + l.principal, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500">Outstanding Balance</div>
          <div className="text-lg font-bold text-gray-900 mt-1">
            KES {loans.reduce((sum, l) => sum + l.balance, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500">In Duplum Reached</div>
          <div className="text-lg font-bold text-orange-600 mt-1">
            {loans.filter(l => l.inDuplumReached).length} loans
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500">Cooling-Off Active</div>
          <div className="text-lg font-bold text-blue-600 mt-1">
            {loans.filter(l => l.coolingOffEndsAt).length} loans
          </div>
        </div>
      </div>
    </div>
  );
}
