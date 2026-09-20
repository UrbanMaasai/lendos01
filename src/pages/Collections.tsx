import { useState } from 'react';
import { collectionCases } from '../data/mockData';
import { Phone, MessageSquare, Shield, AlertTriangle, Clock, CheckCircle, Ban, UserX } from 'lucide-react';

export default function Collections() {
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const filteredCases = collectionCases.filter(c => 
    selectedBucket === 'all' || c.bucket === selectedBucket
  );

  const bucketCounts = {
    all: collectionCases.length,
    '1-30': collectionCases.filter(c => c.bucket === '1-30').length,
    '31-60': collectionCases.filter(c => c.bucket === '31-60').length,
    '61-90': collectionCases.filter(c => c.bucket === '61-90').length,
    '90+': collectionCases.filter(c => c.bucket === '90+').length,
  };

  const handleContact = (caseId: string) => {
    setSelectedCase(caseId);
    setShowContactModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500">DLAK-compliant collections with conduct hard-blocks enforced</p>
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
          {filteredCases.map((c) => (
            <div key={c.id} className="px-5 py-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    c.bucket === '1-30' ? 'bg-amber-100 text-amber-700' :
                    c.bucket === '31-60' ? 'bg-orange-100 text-orange-700' :
                    c.bucket === '61-90' ? 'bg-red-100 text-red-700' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {c.borrowerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{c.borrowerName}</span>
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
                      {c.borrowerPhone} • Loan {c.loanId} • Due: KES {c.amountDue.toLocaleString()} • {c.daysPastDue} days overdue
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-gray-500">
                    <div>Contacts: {c.contactsToday}/{c.maxContactsPerDay}</div>
                    {c.lastContactDate && <div>Last: {c.lastContactDate}</div>}
                    {c.promiseToPay && (
                      <div className="text-blue-600">PTP: KES {c.promiseToPay.amount.toLocaleString()} by {c.promiseToPay.date}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleContact(c.id)}
                    disabled={c.contactsToday >= c.maxContactsPerDay}
                    className={`p-2 rounded-lg transition-colors ${
                      c.contactsToday >= c.maxContactsPerDay
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                    title={c.contactsToday >= c.maxContactsPerDay ? 'Daily contact limit reached' : 'Contact borrower'}
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
                'Payment reminder — your loan of KES {amount} is due on {date}',
                'Friendly follow-up — we noticed your payment is pending',
                'Restructuring offer — would you like to discuss payment options?',
                'Promise-to-pay reminder — your commitment of KES {amount} is due on {date}',
              ].map((template, i) => (
                <label key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="template" className="mt-0.5" />
                  <span className="text-xs text-gray-700">{template}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600" />
                <span className="text-xs text-gray-700">Log as Promise-to-Pay</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                Send & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
