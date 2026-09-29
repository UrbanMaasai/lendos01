import { useState } from 'react';
import { useDB } from '../../contexts/DataContext';
import { Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { LoanProduct } from '../../db/schema';

export default function LoanSimulator() {
  const { db, loading } = useDB();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [amount, setAmount] = useState(15000);
  const [tenure, setTenure] = useState(30);

  if (loading || !db) {
    return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const products = db.products.filter((p: LoanProduct) => p.status === 'active') as LoanProduct[];
  const product = products.find(p => p.id === selectedProduct);

  // Calculate loan details
  const calculateLoan = () => {
    if (!product) return null;

    const principal = amount;
    const interestRate = product.interestRate / 100;
    
    let interest: number;
    if (product.interestMethod === 'flat') {
      interest = principal * interestRate;
    } else {
      // Reducing balance (simplified)
      interest = principal * interestRate * (tenure / 365);
    }

    const processingFee = product.processingFee || 0;
    const totalRepayable = principal + interest + processingFee;
    const apr = ((interest / principal) * (365 / tenure) * 100);
    const dailyCost = (interest + processingFee) / tenure;
    const inDuplumCap = principal * 2;

    return {
      principal,
      interest,
      processingFee,
      totalRepayable,
      apr,
      dailyCost,
      inDuplumCap,
      costPercentage: ((totalRepayable - principal) / principal) * 100,
    };
  };

  const loanDetails = calculateLoan();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Simulator</h1>
        <p className="text-sm text-gray-500">Calculate loan costs before applying</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configure Your Loan</h2>
          </div>

          <div className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (KES {p.minAmount.toLocaleString()} - {p.maxAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {product && (
              <>
                {/* Amount Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount: <span className="text-emerald-600 font-bold">KES {amount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min={product.minAmount}
                    max={product.maxAmount}
                    step={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>KES {product.minAmount.toLocaleString()}</span>
                    <span>KES {product.maxAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Tenure: <span className="text-emerald-600 font-bold">{tenure} days</span>
                  </label>
                  <input
                    type="range"
                    min={7}
                    max={90}
                    step={7}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>7 days</span>
                    <span>90 days</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Loan Breakdown</h2>
          </div>

          {!loanDetails ? (
            <div className="text-center py-12">
              <Calculator size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Select a product to see loan details</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="text-xs text-emerald-700 mb-1">Principal</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    KES {loanDetails.principal.toLocaleString()}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-700 mb-1">Total Repayable</div>
                  <div className="text-2xl font-bold text-blue-900">
                    KES {loanDetails.totalRepayable.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest ({product?.interestRate}%)</span>
                    <span className="font-medium text-gray-900">KES {loanDetails.interest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium text-gray-900">KES {loanDetails.processingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total Cost</span>
                    <span className="font-bold text-gray-900">
                      KES {(loanDetails.interest + loanDetails.processingFee).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* APR and Daily Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="text-xs text-amber-700 mb-1">Annual Percentage Rate (APR)</div>
                  <div className="text-xl font-bold text-amber-900">{loanDetails.apr.toFixed(1)}%</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-xs text-purple-700 mb-1">Daily Cost</div>
                  <div className="text-xl font-bold text-purple-900">
                    KES {loanDetails.dailyCost.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Cost Percentage */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Cost as % of Principal</span>
                  <span className="text-lg font-bold text-gray-900">{loanDetails.costPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      loanDetails.costPercentage > 50 ? 'bg-red-500' :
                      loanDetails.costPercentage > 30 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(loanDetails.costPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Compliance Notices */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">Consumer Protection</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• In duplum cap: KES {loanDetails.inDuplumCap.toLocaleString()} (2× principal)</li>
                      <li>• 24-hour cooling-off period after acceptance</li>
                      <li>• No hidden fees or charges</li>
                      <li>• Early repayment without penalty</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Affordability Check */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-1">Affordability Reminder</p>
                    <p className="text-amber-700">
                      Ensure you can repay KES {loanDetails.totalRepayable.toLocaleString()} by the due date. 
                      Failure to repay may affect your credit score and result in additional charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
