import { useState } from 'react';
import { products } from '../data/mockData';
import { Plus, Settings, Pause, Play, Edit3, Calculator, Shield } from 'lucide-react';

export default function Products() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Builder</h1>
          <p className="text-sm text-gray-500">Configure loan products with compliance controls built in</p>
        </div>
        <button 
          onClick={() => setShowBuilder(!showBuilder)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Product Builder Form */}
      {showBuilder && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
            <button onClick={() => setShowBuilder(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" placeholder="e.g., Salary Advance" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" placeholder="Brief description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (KES)</label>
              <input type="number" placeholder="5,000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (KES)</label>
              <input type="number" placeholder="50,000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
              <input type="number" placeholder="12" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>Flat Rate</option>
                <option>Reducing Balance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (days)</label>
              <input type="number" placeholder="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Approve Threshold (KES)</label>
              <input type="number" placeholder="5,000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          {/* Compliance Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Compliance Settings (Auto-configured)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> KFS auto-generation enabled</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> 24-hour cooling-off period</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> In duplum rule (2× cap)</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Granular consent required</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> APR auto-calculated</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Suitability assessment enabled</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">Estimated APR: <strong className="text-gray-900">175.2%</strong></span>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Save Draft</button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Submit for Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Starter Templates */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-5 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Start Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Salary Advance', desc: 'Employed borrowers, 30-day, scorecard with CRB', tag: 'Conservative' },
            { name: 'Micro Personal', desc: 'Broader retail, flexible eligibility, 60-day', tag: 'Balanced' },
            { name: 'First-Time / Thin-File', desc: 'Limited CRB history, alternative data, controlled', tag: 'Controlled' },
          ].map((template, i) => (
            <button key={i} className="bg-white rounded-lg p-3 border border-gray-200 text-left hover:border-emerald-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{template.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{template.tag}</span>
              </div>
              <p className="text-xs text-gray-500">{template.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' :
                    product.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Edit3 size={14} />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Settings size={14} />
                </button>
                {product.status === 'active' ? (
                  <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Pause size={14} />
                  </button>
                ) : (
                  <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Play size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="text-sm font-semibold text-gray-900">
                  {(product.minAmount/1000).toFixed(0)}K-{(product.maxAmount/1000).toFixed(0)}K
                </div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Rate</div>
                <div className="text-sm font-semibold text-gray-900">{product.interestRate}%</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">APR</div>
                <div className="text-sm font-semibold text-gray-900">{product.apr}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{product.applications} applications</span>
              <span>{product.approvalRate}% approval rate</span>
              <span>Auto-approve ≤KES {(product.autoApproveThreshold/1000).toFixed(0)}K</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
