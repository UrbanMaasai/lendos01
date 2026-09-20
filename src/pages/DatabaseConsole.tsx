import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { useLoans } from '../hooks/useLoans';
import { Database, RefreshCw, Trash2, Play, CheckCircle, AlertTriangle, Hash, Clock } from 'lucide-react';

export default function DatabaseConsole() {
  const { db, loading, reset, audit } = useDB();
  const { loans, products, borrowers, applyForLoan, acceptKFS, runDecision, disburse, recordRepayment } = useLoans();
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'audit' | 'actions'>('overview');
  const [actionLog, setActionLog] = useState<Array<{ type: 'success' | 'error' | 'info'; message: string; time: string }>>([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [principal, setPrincipal] = useState(10000);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState(5000);

  const logAction = (type: 'success' | 'error' | 'info', message: string) => {
    setActionLog(prev => [{ type, message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
  };

  const handleApply = async () => {
    if (!selectedBorrower || !selectedProduct) {
      logAction('error', 'Select borrower and product');
      return;
    }
    try {
      const loan = await applyForLoan(selectedBorrower, selectedProduct, principal);
      logAction('success', `Loan ${loan.id} created — KES ${principal.toLocaleString()}`);
    } catch (e: any) {
      logAction('error', e.message);
    }
  };

  const handleAcceptKFS = async (loanId: string) => {
    try {
      await acceptKFS(loanId);
      logAction('success', `KFS accepted for ${loanId}. Cooling-off started.`);
    } catch (e: any) {
      logAction('error', e.message);
    }
  };

  const handleDecision = async (loanId: string) => {
    try {
      const result = await runDecision(loanId);
      logAction('success', `Decision: ${result.decision} (Score: ${result.score}/100)`);
    } catch (e: any) {
      logAction('error', e.message);
    }
  };

  const handleDisburse = async (loanId: string) => {
    try {
      const txn = await disburse(loanId);
      logAction('success', `Disbursement initiated. M-Pesa txn: ${txn.id}`);
    } catch (e: any) {
      logAction('error', e.message);
    }
  };

  const handleRepay = async (loanId: string) => {
    try {
      const txn = await recordRepayment(loanId, repaymentAmount);
      logAction('success', `Repayment KES ${repaymentAmount.toLocaleString()} received. Receipt: ${txn.mpesaReceipt}`);
    } catch (e: any) {
      logAction('error', e.message);
    }
  };

  if (loading || !db) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Initializing database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database size={24} /> Backend Console
          </h1>
          <p className="text-sm text-gray-500">Interactive database — simulate the full lending lifecycle</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            PostgreSQL (simulated)
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Trash2 size={14} /> Reset DB
          </button>
        </div>
      </div>

      {/* DB Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Tenants', value: db.tenants.length, icon: '🏢' },
          { label: 'Users', value: db.users.length, icon: '👤' },
          { label: 'Borrowers', value: db.borrowers.length, icon: '🧑' },
          { label: 'Products', value: db.products.length, icon: '📦' },
          { label: 'Loans', value: db.loans.length, icon: '📄' },
          { label: 'Audit Entries', value: db.auditLog.length, icon: '🔒' },
          { label: 'Alerts', value: db.alerts.filter(a => !a.resolved).length, icon: '🚨' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'loans', label: 'Loan Lifecycle' },
          { id: 'audit', label: 'Audit Log' },
          { id: 'actions', label: 'Action Log' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Database size={16} /> Database Schema (Prisma)
            </h3>
            <pre className="text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`model Tenant {
  id          String   @id @default(cuid())
  name        String
  subdomain   String   @unique
  tier        Tier     @default(free)
  activeLoans Int      @default(0)
  maxLoans    Int
  status      Status   @default(active)
  loans       Loan[]
  createdAt   DateTime @default(now())
}

model Loan {
  id              String     @id @default(cuid())
  tenantId        String
  borrowerId      String
  productId       String
  principal       Int
  totalRepayable  Int
  amountPaid      Int        @default(0)
  balance         Int
  inDuplumCap     Int        // 2× principal — HARD CAP
  inDuplumReached Boolean    @default(false)
  status          LoanStatus
  coolingOffEndsAt DateTime?
  kfsAcceptedAt   DateTime?
  disbursedAt     DateTime?
  dueDate         DateTime
  daysPastDue     Int        @default(0)
  createdAt       DateTime   @default(now())
  
  @@index([tenantId])  // Row-level security
  @@index([status])
}

model AuditLog {
  id            String   @id @default(cuid())
  timestamp     DateTime @default(now())
  action        String
  entityType    String
  entityId      String
  details       String
  previousHash  String   // Hash chain
  hash          String   // SHA-256
  retentionUntil DateTime // 7 years
  
  @@index([tenantId, timestamp])
}`}
            </pre>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Compliance Hard-Blocks Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { code: 'CL-005', name: 'No contact list access', active: true },
                { code: 'CL-006', name: 'No third-party messaging', active: true },
                { code: 'CL-007', name: 'No social media shaming', active: true },
                { code: 'CL-008', name: 'Pre-approved templates only', active: true },
                { code: 'LS-005', name: 'In duplum (2× cap)', active: true },
                { code: 'KFS-001', name: 'KFS auto-generation', active: true },
                { code: 'COP-001', name: 'Cooling-off enforcement', active: true },
                { code: 'CON-001', name: 'Granular consent', active: true },
                { code: 'SUI-001', name: 'Affordability (DTI)', active: true },
                { code: 'CA-001', name: 'Tamper-evident audit', active: true },
              ].map((block, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-xs font-mono text-green-700">{block.code}</span>
                    <span className="text-sm text-gray-700">{block.name}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">ENFORCED</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="space-y-4">
          {/* Apply for Loan */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Play size={16} className="text-emerald-600" /> Step 1: Apply for Loan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select value={selectedBorrower} onChange={e => setSelectedBorrower(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Select borrower...</option>
                {borrowers.map(b => (
                  <option key={b.id} value={b.id}>{b.firstName} {b.lastName} ({b.phone})</option>
                ))}
              </select>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (KES {p.minAmount.toLocaleString()}-{p.maxAmount.toLocaleString()})</option>
                ))}
              </select>
              <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} placeholder="Amount" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={handleApply} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
                Submit Application
              </button>
            </div>
          </div>

          {/* Loan Pipeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Loan Pipeline — Full Lifecycle</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Loan</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Principal</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Balance</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">In Duplum</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loans.slice(0, 10).map(loan => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-mono text-xs">{loan.id}</div>
                        <div className="text-xs text-gray-500">{borrowers.find(b => b.id === loan.borrowerId)?.firstName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                          loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          loan.status === 'cooling_off' ? 'bg-purple-100 text-purple-700' :
                          loan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          loan.status === 'rejected' ? 'bg-gray-200 text-gray-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {loan.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">KES {loan.principal.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">KES {loan.balance.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        {loan.inDuplumReached ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">2× REACHED</span>
                        ) : (
                          <span className="text-xs text-gray-400">KES {loan.inDuplumCap.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {(loan.status === 'applied' || loan.status === 'kyc_verified') && (
                            <button onClick={() => handleAcceptKFS(loan.id)} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200">KFS</button>
                          )}
                          {loan.status === 'cooling_off' && new Date(loan.coolingOffEndsAt || 0) <= new Date() && (
                            <button onClick={() => handleDecision(loan.id)} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded hover:bg-purple-200">Decide</button>
                          )}
                          {loan.status === 'approved' && (
                            <button onClick={() => handleDisburse(loan.id)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-200">Disburse</button>
                          )}
                          {(loan.status === 'active' || loan.status === 'overdue' || loan.status === 'disbursed') && (
                            <button onClick={() => { setSelectedLoan(loan.id); setRepaymentAmount(Math.min(5000, loan.balance)); }} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded hover:bg-indigo-200">Repay</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Repayment */}
          {selectedLoan && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Record Repayment (M-Pesa C2B)</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Loan: <strong>{selectedLoan}</strong></span>
                <input type="number" value={repaymentAmount} onChange={e => setRepaymentAmount(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32" />
                <button onClick={() => { handleRepay(selectedLoan); setSelectedLoan(''); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Submit via Paybill
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">Tamper-evident • Hash-chained • {db.auditLog.length} entries • 7-year retention</span>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Time</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Action</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Details</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...db.auditLog].reverse().map((entry, i) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2 text-xs font-mono text-gray-700">{entry.userName}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        entry.action.includes('BLOCK') || entry.action.includes('DUPLUM') ? 'bg-red-100 text-red-700' :
                        entry.action.includes('CONSENT') ? 'bg-blue-100 text-blue-700' :
                        entry.action.includes('APPROVED') || entry.action.includes('DISBURSED') || entry.action.includes('REPAYMENT') ? 'bg-green-100 text-green-700' :
                        entry.action === 'DATABASE_INITIALIZED' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600 max-w-xs truncate">{entry.details}</td>
                    <td className="px-4 py-2 text-xs text-gray-400 font-mono">{entry.hash.slice(0, 12)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} /> Recent Actions
          </h3>
          {actionLog.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No actions yet. Try creating a loan in the "Loan Lifecycle" tab.</p>
          ) : (
            <div className="space-y-2">
              {actionLog.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${
                  log.type === 'success' ? 'bg-green-50' :
                  log.type === 'error' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  {log.type === 'success' ? <CheckCircle size={14} className="text-green-600 mt-0.5" /> :
                   log.type === 'error' ? <AlertTriangle size={14} className="text-red-600 mt-0.5" /> :
                   <RefreshCw size={14} className="text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{log.message}</div>
                    <div className="text-xs text-gray-500">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
