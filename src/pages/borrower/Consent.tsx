import { useState, useEffect } from 'react';
import { useDB } from '../../contexts/DataContext';
import { grantConsent, hasConsent, genId } from '../../db/services';
import type { ConsentType } from '../../db/schema';
import { Shield, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const CONSENT_ITEMS: { type: ConsentType; label: string; description: string; required: boolean }[] = [
  { type: 'data_processing', label: 'Data Processing', description: 'We need to process your personal data to provide this loan service, as described in our Privacy Policy.', required: true },
  { type: 'credit_check', label: 'Credit Bureau Check', description: 'Permission to pull your credit report from a licensed CRB to assess your application.', required: true },
  { type: 'crb_reporting', label: 'CRB Reporting', description: 'Permission to report your loan performance to credit bureaus (positive and negative).', required: false },
  { type: 'marketing', label: 'Marketing Communications', description: 'Receive promotional messages about new products and offers via SMS.', required: false },
];

interface ConsentPageProps {
  borrowerId: string;
  onComplete: () => void;
}

export default function ConsentPage({ borrowerId, onComplete }: ConsentPageProps) {
  const { db, mutate, audit } = useDB();
  const [consents, setConsents] = useState<Record<string, boolean>>({
    data_processing: false,
    credit_check: false,
    crb_reporting: false,
    marketing: false,
  });
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already consented
    if (db && hasConsent(db, borrowerId, 'data_processing') && hasConsent(db, borrowerId, 'credit_check')) {
      onComplete();
    }
  }, [db, borrowerId]);

  const allRequired = consents.data_processing && consents.credit_check;

  const handleAccept = async () => {
    if (!allRequired) {
      setError('You must accept all required consent items to continue.');
      return;
    }

    // Grant all selected consents
    Object.entries(consents).forEach(([type, granted]) => {
      if (granted) {
        grantConsent(db!, borrowerId, type as ConsentType, '2.1');
      }
    });
    mutate(() => {});
    await audit('CONSENT_GRANTED', 'Borrower', borrowerId, `Consent granted: ${Object.entries(consents).filter(([,v]) => v).map(([k]) => k).join(', ')}`);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-gray-900">Your Privacy Matters</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">How we use your data</h1>
          <p className="text-sm text-gray-600">
            We're committed to transparency. Please review how we'll use your information. 
            You can withdraw consent at any time from your settings.
          </p>
        </div>

        {/* Consent Items */}
        <div className="space-y-3 mb-6">
          {CONSENT_ITEMS.map((item) => (
            <label
              key={item.type}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                consents[item.type]
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={consents[item.type]}
                onChange={(e) => {
                  setConsents(prev => ({ ...prev, [item.type]: e.target.checked }));
                  setError('');
                }}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                  {item.required && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Required</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Privacy Notice */}
        <div
          className="bg-gray-100 rounded-xl p-4 mb-6 max-h-40 overflow-y-auto text-xs text-gray-600 leading-relaxed border border-gray-200"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) {
              setScrolledToBottom(true);
            }
          }}
        >
          <p className="font-semibold text-gray-700 mb-2">Privacy Policy Summary</p>
          <p className="mb-2">
            Mika Lenders Ltd ("we", "our") is a licensed Digital Credit Provider regulated by the Central Bank of Kenya (CBK). 
            We collect, process, and store your personal data in accordance with the Data Protection Act, 2019.
          </p>
          <p className="mb-2">
            <strong>Data we collect:</strong> National ID number, phone number, employment details, income information, 
            credit history from licensed CRBs, and loan transaction data.
          </p>
          <p className="mb-2">
            <strong>How we use it:</strong> To assess your loan application, calculate affordability, 
            disburse and collect loans via M-Pesa, report to CRBs (with consent), and comply with regulatory requirements.
          </p>
          <p className="mb-2">
            <strong>Your rights:</strong> You can access, correct, or delete your data. You can withdraw consent at any time. 
            You can lodge a complaint with the Office of the Data Protection Commissioner (ODPC).
          </p>
          <p className="mb-2">
            <strong>Data retention:</strong> We retain your data for 7 years as required by CBK regulations, 
            after which it is securely deleted.
          </p>
          <p>
            <strong>Contact our Data Protection Officer:</strong> dpo@mikalenders.co.ke | +254 712 345 678
          </p>
          {!scrolledToBottom && (
            <p className="text-emerald-600 font-medium mt-2 text-center">↓ Scroll to read full policy</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAccept}
          disabled={!allRequired}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            allRequired
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {allRequired ? 'I Agree & Continue' : 'Accept required items to continue'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          By continuing, you confirm that you have read and understood the privacy policy.
        </p>
      </div>
    </div>
  );
}
