import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { useCollections } from '../hooks/useCollections';
import type { CollectionCase } from '../db/schema';
import { Phone, Shield, AlertTriangle, Clock, CheckCircle, Ban, UserX, MessageSquare } from 'lucide-react';

export default function Collections() {
  const { db, loading } = useDB();
  const { cases, contactBorrower, logPTP } = useCollections();
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [ptpAmount, setPtpAmount] = useState(0);
  const [ptpDate, setPtpDate] = useState('');

  if (loading || !db) {
    return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const filteredCases = cases.filter((c: CollectionCase) => 
    selectedBucket === 'all' || c.bucket === selectedBucket
  );

  const bucketCounts = {
    all: cases.length,
    '1-30': cases.filter((c: CollectionCase) => c.bucket === '1-30').length,
    '31-60': cases.filter((c: CollectionCase) => c.bucket === '31-60').length,
    '61-90': cases.filter((c: CollectionCase) => c.bucket === '61-90').length,
    '90+': cases.filter((c: CollectionCase) => c.bucket === '90+').length,
  };

  const handleContact = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setContactError(null);
    setShowContactModal(true);
  };

  const sendContact = async (templateId: string) => {
    if (!selectedCaseId) return;
    try {
      await contactBorrower(selectedCaseId, 'sms', templateId, `Template: ${templateId}`);
      setShowContactModal(false);
    } catch (e: any) {
      setContactError(e.message);
    }
  };

  const handlePTP = async () => {
    if (!selectedCaseId || !ptpAmount || !ptpDate) return;
    await logPTP(selectedCaseId, ptpAmount, ptpDate);
    setShowContactModal(false);
    setPtpAmount(0);
    setPtpDate('');
  };

  const getBorrowerName = (borrowerId: string) => {
    const b = db.borrowers.find((x: any) => x.id === borrowerId);
    return b ? `${b.firstName} ${b.lastName}` : borrowerId;
  };

  const getBorrowerPhone = (borrowerId: string) => {
    const b = db.borrowers.find((x: any) => x.id === borrowerId);
    return b?.phone || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500">DLAK-compliant • {cases.length} active cases • Conduct hard-blocks enforced</p>
        </div>
      </div>

      {/* Hard-Block Warnings */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Ban size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Conduct Hard-Blocks Active</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-red-700">
                <UserX size={12} /> No contact list access
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-700">
                <MessageSquare size={12} /> No third-party messaging
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-700">
                <Shield size={12} /> No social media shaming
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-700">
                <AlertTriangle size={12} /> Pre-approved templates only
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bucket Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(bucketCounts).map(([bucket, count]) => (
          <button
            key={bucket}
            onClick={() => setSelectedBucket(bucket)}
            className={`p-4 rounded-xl border transition-all ${
              selectedBucket === bucket 
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {bucket === 'all' ? 'All Cases' : `${bucket} DPD`}
            </div>
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            {bucket !== 'all' && (
              <div className={`text-xs mt-1 ${
                bucket === '1-30' ? 'text-amber-600' :
                bucket === '31-60' ? 'text-orange-600' :
                bucket === '61-90' ? 'text-red-600' :
                'text-red-800'
              }`}>
                {bucket === '1-30' ? 'Reminder tone' :
                 bucket === '31-60' ? 'Firm tone' :
                 bucket === '61-90' ? 'Formal demand' :
                 'Legal pathway'}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Collections Queue */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Collections Queue</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            Permitted hours: 07:00 - 20:00 | Max 3 contacts/day
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredCases.map((c: CollectionCase) => (
            <div key={c.id} className="px-5 py-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    c.bucket === '1-30' ? 'bg-amber-100 text-amber-700' :
                    c.bucket === '31-60' ? 'bg-orange-100 text-orange-700' :
                    c.bucket === '61-90' ? 'bg-red-100 text-red-700' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {getBorrowerName(c.borrowerId).split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{getBorrowerName(c.borrowerId)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        c.bucket === '1-30' ? 'bg-amber-100 text-amber-700' :
                        c.bucket === '31-60' ? 'bg-orange-100 text-orange-700' :
                        c.bucket === '61-90' ? 'bg-red-100 text-red-700' :
                        'bg-red-200 text-red-900'
                      }`}>
                        {c.bucket} DPD
                      </span>
                      {c.status === 'ptp' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">PTP</span>
                      )}
                      {c.status === 'escalated' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Escalated</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {getBorrowerPhone(c.borrowerId)} • Loan {c.loanId} • Due: KES {c.amountDue.toLocaleString()} • {c.daysPastDue} days overdue
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-gray-500">
                    <div>Contacts: {c.contactsToday}/3</div>
                    {c.lastContactAt && <div>Last: {new Date(c.lastContactAt).toLocaleDateString()}</div>}
                    {c.promiseToPay && (
                      <div className="text-blue-600">PTP: KES {c.promiseToPay.amount.toLocaleString()} by {c.promiseToPay.date}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleContact(c.id)}
                    disabled={c.contactsToday >= 3}
                    className={`p-2 rounded-lg transition-colors ${
                      c.contactsToday >= 3
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                    title={c.contactsToday >= 3 ? 'Daily contact limit reached' : 'Contact borrower'}
                  >
                    <Phone size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Borrower</h3>
            <p className="text-sm text-gray-500 mb-4">
              Only pre-approved templates available. Free-text messaging is disabled.
            </p>
            
            {contactError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-red-800">
                  <AlertTriangle size={14} />
                  <span className="font-medium">Contact blocked:</span>
                </div>
                <p className="text-xs text-red-700 mt-1">{contactError}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <Shield size={14} />
                <span className="font-medium">Conduct rules enforced</span>
              </div>
              <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                <li>• Only borrower can be contacted (no third parties)</li>
                <li>• Permitted hours: 07:00 - 20:00</li>
                <li>• All communications logged with content hash</li>
              </ul>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-700">Select template:</p>
              {[
                { id: 'TPL-001', text: 'Payment reminder — your loan is due soon' },
                { id: 'TPL-002', text: 'Friendly follow-up — payment is pending' },
                { id: 'TPL-003', text: 'Restructuring offer — discuss payment options' },
                { id: 'TPL-004', text: 'PTP reminder — commitment due soon' },
              ].map((template) => (
                <button
                  key={template.id}
                  onClick={() => sendContact(template.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 border border-gray-100 text-xs text-gray-700 transition-colors"
                >
                  <span className="font-mono text-gray-400 mr-2">{template.id}</span>
                  {template.text}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Or log Promise-to-Pay:</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Amount" value={ptpAmount} onChange={e => setPtpAmount(Number(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="date" value={ptpDate} onChange={e => setPtpDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <button onClick={handlePTP} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Log PTP</button>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
