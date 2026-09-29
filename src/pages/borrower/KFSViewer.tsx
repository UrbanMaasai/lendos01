import { useState } from 'react';
import { Shield, ChevronDown, CheckCircle } from 'lucide-react';

interface KFSViewerProps {
  loan: {
    principal: number;
    interestRate: number;
    interestMethod: string;
    tenureDays: number;
    processingFee: number;
    totalRepayable: number;
    dueDate: string;
    productName: string;
    inDuplumCap: number;
  };
  onAccept: () => void;
}

export default function KFSViewer({ loan, onAccept }: KFSViewerProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const totalInterest = loan.totalRepayable - loan.principal - loan.processingFee;
  const apr = ((totalInterest / loan.principal) * (365 / loan.tenureDays) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-emerald-600" />
          <span className="font-semibold text-gray-900">Key Facts Statement</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          {/* KFS Header */}
          <div className="bg-emerald-600 text-white px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} />
              <span className="text-xs font-medium opacity-90">Regulatory Document</span>
            </div>
            <h2 className="text-lg font-bold">Key Facts Statement</h2>
            <p className="text-xs opacity-90 mt-1">{loan.productName}</p>
          </div>

          {/* KFS Content */}
          <div
            className="p-4 max-h-96 overflow-y-auto"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) {
                setScrolledToBottom(true);
              }
            }}
          >
            <div className="space-y-4 text-sm">
              {/* Loan Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Loan Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Principal Amount</span>
                    <span className="font-semibold text-gray-900">KES {loan.principal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-gray-900">{loan.interestRate}% ({loan.interestMethod})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Annual Percentage Rate (APR)</span>
                    <span className="font-semibold text-gray-900">{apr}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold text-gray-900">KES {loan.processingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Total Interest</span>
                    <span className="font-semibold text-gray-900">KES {totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 bg-emerald-50 -mx-2 px-2 rounded">
                    <span className="font-semibold text-gray-900">Total Repayable</span>
                    <span className="font-bold text-emerald-700">KES {loan.totalRepayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Repayment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Repayment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-semibold text-gray-900">{loan.tenureDays} days</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Due Date</span>
                    <span className="font-semibold text-gray-900">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Repayment Method</span>
                    <span className="font-semibold text-gray-900">M-Pesa Paybill</span>
                  </div>
                </div>
              </div>

              {/* Fees & Penalties */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Fees & Penalties</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Late Payment Penalty</span>
                    <span className="font-semibold text-gray-900">1% per day</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Grace Period</span>
                    <span className="font-semibold text-gray-900">0 days</span>
                  </div>
                </div>
              </div>

              {/* Important Notices */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="font-semibold text-blue-900 mb-2 text-xs uppercase tracking-wide">Important Notices</h3>
                <ul className="space-y-1.5 text-xs text-blue-800">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={12} className="shrink-0 mt-0.5" />
                    <span><strong>In Duplum Rule:</strong> Maximum payable capped at KES {loan.inDuplumCap.toLocaleString()} (2× principal). No further charges after this limit.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={12} className="shrink-0 mt-0.5" />
                    <span><strong>Cooling-Off Period:</strong> You have 24 hours to cancel this loan without any penalty after acceptance.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={12} className="shrink-0 mt-0.5" />
                    <span><strong>CRB Reporting:</strong> Your loan performance will be reported to credit bureaus.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={12} className="shrink-0 mt-0.5" />
                    <span><strong>Early Repayment:</strong> You can repay early without penalty.</span>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-xs text-gray-500 pt-2">
                <p className="font-semibold text-gray-700 mb-1">Questions or Complaints?</p>
                <p>Customer Care: +254 712 345 678</p>
                <p>Email: support@mikalenders.co.ke</p>
                <p className="mt-2">Regulated by Central Bank of Kenya (CBK)</p>
                <p>DCP License: DCP/2025/0047</p>
              </div>
            </div>

            {!scrolledToBottom && (
              <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent pt-4 pb-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-medium">
                  <ChevronDown size={14} className="animate-bounce" />
                  Scroll down to read all terms
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accept Button */}
        <div className="space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!scrolledToBottom}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
            />
            <span className="text-xs text-gray-700">
              I have read and understood the Key Facts Statement. I accept the terms and conditions of this loan.
            </span>
          </label>

          <button
            onClick={onAccept}
            disabled={!scrolledToBottom || !accepted}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              scrolledToBottom && accepted
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!scrolledToBottom ? 'Scroll to read all terms' : !accepted ? 'Accept terms to continue' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
