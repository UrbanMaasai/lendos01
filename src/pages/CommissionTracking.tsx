import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { DollarSign, TrendingUp, Users, Award, Calendar, Filter, Clock, CheckCircle } from 'lucide-react';

interface CommissionRecord {
  id: string;
  loanOfficerId: string;
  loanOfficerName: string;
  loanId: string;
  borrowerName: string;
  loanAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  loanStatus: string;
  disbursedAt: string;
  paidAt?: string;
  notes?: string;
}

interface LoanOfficer {
  id: string;
  name: string;
  email: string;
  commissionRate: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  loansOriginated: number;
  activeLoans: number;
}

export default function CommissionTracking() {
  const { db, mutate, audit } = useDB();
  const [selectedOfficer, setSelectedOfficer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90' | 'all'>('30');

  // Mock loan officers
  const loanOfficers: LoanOfficer[] = [
    {
      id: 'U-JANE',
      name: 'Jane Collections',
      email: 'jane@mikalenders.co.ke',
      commissionRate: 2.5,
      totalCommission: 245000,
      pendingCommission: 45000,
      paidCommission: 200000,
      loansOriginated: 156,
      activeLoans: 89,
    },
    {
      id: 'U-MARK',
      name: 'Mark Otieno',
      email: 'mark@mikalenders.co.ke',
      commissionRate: 2.0,
      totalCommission: 189000,
      pendingCommission: 32000,
      paidCommission: 157000,
      loansOriginated: 134,
      activeLoans: 67,
    },
    {
      id: 'U-DAVID',
      name: 'David Loans',
      email: 'david@mikalenders.co.ke',
      commissionRate: 2.5,
      totalCommission: 167000,
      pendingCommission: 28000,
      paidCommission: 139000,
      loansOriginated: 112,
      activeLoans: 54,
    },
  ];

  // Mock commission records
  const [commissions, setCommissions] = useState<CommissionRecord[]>([
    {
      id: 'COM-001',
      loanOfficerId: 'U-JANE',
      loanOfficerName: 'Jane Collections',
      loanId: 'LN-001',
      borrowerName: 'James Mwangi',
      loanAmount: 15000,
      commissionRate: 2.5,
      commissionAmount: 375,
      status: 'paid',
      loanStatus: 'active',
      disbursedAt: '2026-01-15T10:30:00Z',
      paidAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'COM-002',
      loanOfficerId: 'U-JANE',
      loanOfficerName: 'Jane Collections',
      loanId: 'LN-002',
      borrowerName: 'Mary Wanjiku',
      loanAmount: 25000,
      commissionRate: 2.5,
      commissionAmount: 625,
      status: 'paid',
      loanStatus: 'active',
      disbursedAt: '2026-01-20T14:20:00Z',
      paidAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'COM-003',
      loanOfficerId: 'U-MARK',
      loanOfficerName: 'Mark Otieno',
      loanId: 'LN-003',
      borrowerName: 'Peter Ochieng',
      loanAmount: 10000,
      commissionRate: 2.0,
      commissionAmount: 200,
      status: 'pending',
      loanStatus: 'overdue',
      disbursedAt: '2026-01-05T09:15:00Z',
    },
    {
      id: 'COM-004',
      loanOfficerId: 'U-DAVID',
      loanOfficerName: 'David Loans',
      loanId: 'LN-004',
      borrowerName: 'Grace Akinyi',
      loanAmount: 8000,
      commissionRate: 2.5,
      commissionAmount: 200,
      status: 'approved',
      loanStatus: 'active',
      disbursedAt: '2026-01-25T11:00:00Z',
    },
    {
      id: 'COM-005',
      loanOfficerId: 'U-JANE',
      loanOfficerName: 'Jane Collections',
      loanId: 'LN-005',
      borrowerName: 'David Kamau',
      loanAmount: 50000,
      commissionRate: 2.5,
      commissionAmount: 1250,
      status: 'pending',
      loanStatus: 'overdue',
      disbursedAt: '2026-01-28T16:45:00Z',
    },
  ]);

  const handleApproveCommission = (commissionId: string) => {
    setCommissions(commissions.map(c => 
      c.id === commissionId 
        ? { ...c, status: 'approved' as const }
        : c
    ));
    audit('COMMISSION_APPROVED', 'Commission', commissionId, 'Commission approved for payment');
  };

  const handleMarkPaid = (commissionId: string) => {
    setCommissions(commissions.map(c => 
      c.id === commissionId 
        ? { ...c, status: 'paid' as const, paidAt: new Date().toISOString() }
        : c
    ));
    audit('COMMISSION_PAID', 'Commission', commissionId, 'Commission marked as paid');
  };

  const handleBatchPay = (officerId: string) => {
    const pendingCommissions = commissions.filter(
      c => c.loanOfficerId === officerId && c.status === 'approved'
    );

    setCommissions(commissions.map(c => {
      if (c.loanOfficerId === officerId && c.status === 'approved') {
        return { ...c, status: 'paid' as const, paidAt: new Date().toISOString() };
      }
      return c;
    }));

    const totalPaid = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    audit('COMMISSION_BATCH_PAID', 'LoanOfficer', officerId, `Batch payment: KES ${totalPaid.toLocaleString()} for ${pendingCommissions.length} commissions`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredCommissions = commissions.filter(c => {
    if (selectedOfficer !== 'all' && c.loanOfficerId !== selectedOfficer) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    
    if (timeframe !== 'all') {
      const daysAgo = parseInt(timeframe);
      const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      if (new Date(c.disbursedAt).getTime() < cutoff) return false;
    }
    
    return true;
  });

  const totalStats = {
    totalCommission: loanOfficers.reduce((sum, o) => sum + o.totalCommission, 0),
    pendingCommission: loanOfficers.reduce((sum, o) => sum + o.pendingCommission, 0),
    paidCommission: loanOfficers.reduce((sum, o) => sum + o.paidCommission, 0),
    totalLoans: loanOfficers.reduce((sum, o) => sum + o.loansOriginated, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commission Tracking</h1>
        <p className="text-gray-600 mt-1">
          Track and manage loan officer commissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-gray-600">Total Commission</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            KES {(totalStats.totalCommission / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            KES {(totalStats.pendingCommission / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Paid</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            KES {(totalStats.paidCommission / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Loans</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalLoans}</div>
        </div>
      </div>

      {/* Loan Officers Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Officers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loanOfficers.map(officer => (
            <div key={officer.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{officer.name}</h3>
                  <p className="text-xs text-gray-500">{officer.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission Rate:</span>
                  <span className="font-medium">{officer.commissionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loans Originated:</span>
                  <span className="font-medium">{officer.loansOriginated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Loans:</span>
                  <span className="font-medium">{officer.activeLoans}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Total Earned:</span>
                    <span className="font-semibold text-emerald-600">
                      KES {officer.totalCommission.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium text-yellow-600">
                      KES {officer.pendingCommission.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">
                      KES {officer.paidCommission.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleBatchPay(officer.id)}
                  disabled={commissions.filter(c => c.loanOfficerId === officer.id && c.status === 'approved').length === 0}
                  className="w-full mt-3 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Pay All Approved
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Officers</option>
              {loanOfficers.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Commission Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Commission Records</h2>
        </div>
        {filteredCommissions.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No commission records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Loan Amount</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCommissions.map(commission => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{commission.loanOfficerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{commission.loanId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{commission.borrowerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      KES {commission.loanAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {commission.commissionRate}%
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                      KES {commission.commissionAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(commission.status)}`}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {commission.status === 'pending' && (
                        <button
                          onClick={() => handleApproveCommission(commission.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Approve
                        </button>
                      )}
                      {commission.status === 'approved' && (
                        <button
                          onClick={() => handleMarkPaid(commission.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Mark Paid
                        </button>
                      )}
                      {commission.status === 'paid' && (
                        <span className="text-xs text-gray-500">
                          {new Date(commission.paidAt!).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
