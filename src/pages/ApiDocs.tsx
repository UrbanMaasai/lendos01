import { useState } from 'react';
import { Code, Copy, CheckCircle, ChevronRight, Lock, Globe, Zap, Database, Shield, Webhook } from 'lucide-react';

const endpoints = {
  auth: [
    { method: 'POST', path: '/api/v1/auth/register', desc: 'Register new borrower', auth: false },
    { method: 'POST', path: '/api/v1/auth/otp/send', desc: 'Send OTP to phone', auth: false },
    { method: 'POST', path: '/api/v1/auth/otp/verify', desc: 'Verify OTP', auth: false },
    { method: 'POST', path: '/api/v1/auth/login', desc: 'Lender staff login', auth: false },
    { method: 'POST', path: '/api/v1/auth/refresh', desc: 'Refresh access token', auth: true },
  ],
  borrowers: [
    { method: 'GET', path: '/api/v1/borrowers', desc: 'List borrowers (paginated)', auth: true },
    { method: 'GET', path: '/api/v1/borrowers/:id', desc: 'Get borrower details', auth: true },
    { method: 'POST', path: '/api/v1/borrowers/:id/kyc', desc: 'Submit KYC documents', auth: true },
    { method: 'GET', path: '/api/v1/borrowers/:id/consents', desc: 'Get consent records', auth: true },
    { method: 'POST', path: '/api/v1/borrowers/:id/consents', desc: 'Grant/withdraw consent', auth: true },
  ],
  products: [
    { method: 'GET', path: '/api/v1/products', desc: 'List loan products', auth: true },
    { method: 'GET', path: '/api/v1/products/:id', desc: 'Get product details', auth: true },
    { method: 'POST', path: '/api/v1/products', desc: 'Create new product', auth: true },
    { method: 'PUT', path: '/api/v1/products/:id', desc: 'Update product', auth: true },
    { method: 'POST', path: '/api/v1/products/:id/approve', desc: 'Approve product change', auth: true },
  ],
  loans: [
    { method: 'POST', path: '/api/v1/loans', desc: 'Submit loan application', auth: true },
    { method: 'GET', path: '/api/v1/loans', desc: 'List loans (paginated)', auth: true },
    { method: 'GET', path: '/api/v1/loans/:id', desc: 'Get loan details', auth: true },
    { method: 'GET', path: '/api/v1/loans/:id/kfs', desc: 'Get Key Facts Statement', auth: true },
    { method: 'POST', path: '/api/v1/loans/:id/kfs/accept', desc: 'Accept KFS', auth: true },
    { method: 'POST', path: '/api/v1/loans/:id/decision', desc: 'Run decision engine', auth: true },
    { method: 'POST', path: '/api/v1/loans/:id/disburse', desc: 'Disburse loan', auth: true },
    { method: 'POST', path: '/api/v1/loans/:id/restructure', desc: 'Restructure loan', auth: true },
  ],
  payments: [
    { method: 'POST', path: '/api/v1/payments/stk-push', desc: 'Initiate STK Push', auth: true },
    { method: 'GET', path: '/api/v1/payments/stk/:requestId/status', desc: 'Query STK status', auth: true },
    { method: 'POST', path: '/api/v1/integrations/mpesa/c2b/confirmation', desc: 'M-Pesa C2B callback', auth: false },
    { method: 'POST', path: '/api/v1/integrations/mpesa/b2c/result', desc: 'M-Pesa B2C callback', auth: false },
    { method: 'POST', path: '/api/v1/integrations/mpesa/stk/callback', desc: 'M-Pesa STK callback', auth: false },
  ],
  collections: [
    { method: 'GET', path: '/api/v1/collections/cases', desc: 'List collection cases', auth: true },
    { method: 'POST', path: '/api/v1/collections/cases/:id/contact', desc: 'Log borrower contact', auth: true },
    { method: 'POST', path: '/api/v1/collections/cases/:id/ptp', desc: 'Log promise-to-pay', auth: true },
    { method: 'POST', path: '/api/v1/collections/cases/:id/escalate', desc: 'Escalate case', auth: true },
  ],
  compliance: [
    { method: 'GET', path: '/api/v1/compliance/audit-log', desc: 'Query audit log', auth: true },
    { method: 'GET', path: '/api/v1/compliance/alerts', desc: 'List compliance alerts', auth: true },
    { method: 'POST', path: '/api/v1/compliance/alerts/:id/resolve', desc: 'Resolve alert', auth: true },
    { method: 'GET', path: '/api/v1/compliance/reports/cbk', desc: 'Generate CBK report', auth: true },
    { method: 'GET', path: '/api/v1/compliance/reports/dlak', desc: 'Generate DLAK report', auth: true },
  ],
};

const codeExamples = {
  apply: `// Apply for a loan
const response = await fetch('https://api.lendingos.co.ke/v1/loans', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'your-tenant-id'
  },
  body: JSON.stringify({
    borrowerId: 'BR-001',
    productId: 'P-001',
    principal: 15000
  })
});

const loan = await response.json();
// { id: 'LN-001', status: 'applied', totalRepayable: 16200, ... }`,
  
  stkPush: `// Initiate M-Pesa STK Push
const response = await fetch('https://api.lendingos.co.ke/v1/payments/stk-push', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    loanId: 'LN-001',
    phone: '+254712345678',
    amount: 16200
  })
});

// Response: { requestId: 'STK-123', status: 'pending' }
// Wait for callback or poll status`,

  webhook: `// Webhook handler for loan events
app.post('/webhooks/lendingos', (req, res) => {
  const signature = req.headers['x-lendingos-signature'];
  
  // Verify webhook signature
  if (!verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'loan.disbursed':
      console.log('Loan disbursed:', data.loanId);
      break;
    case 'loan.repaid':
      console.log('Repayment received:', data.amount);
      break;
    case 'compliance.alert':
      console.log('Compliance alert:', data.title);
      break;
  }
  
  res.status(200).send('OK');
});`,
};

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState<keyof typeof endpoints>('auth');
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700';
      case 'POST': return 'bg-green-100 text-green-700';
      case 'PUT': return 'bg-amber-100 text-amber-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Code size={20} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Developer Documentation</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">LendingOS API Reference</h1>
          <p className="text-slate-300 max-w-2xl">
            Build compliant lending experiences with our RESTful API. Multi-tenant, audit-logged, 
            and compliance-enforced at every endpoint.
          </p>
          <div className="flex items-center gap-4 mt-6 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-slate-300">Base URL: <code className="bg-slate-700 px-2 py-0.5 rounded text-emerald-300">https://api.lendingos.co.ke/v1</code></span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Version: 1.0.0</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">API Reference</p>
              {Object.keys(endpoints).map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section as keyof typeof endpoints)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeSection === section
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {section}
                  <span className="text-xs text-gray-400 ml-1">({endpoints[section as keyof typeof endpoints].length})</span>
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Guides</p>
                <a href="#authentication" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Authentication</a>
                <a href="#rate-limits" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Rate Limits</a>
                <a href="#webhooks" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Webhooks</a>
                <a href="#errors" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Error Codes</a>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Start */}
            <section id="authentication" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Authentication</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                All API requests require a Bearer token in the Authorization header. Get your API key from the Settings page.
              </p>
              <div className="bg-slate-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyCode('Authorization: Bearer YOUR_API_KEY\nX-Tenant-ID: your-tenant-id', 'auth')}
                  className="absolute top-3 right-3 p-1.5 rounded hover:bg-slate-700 text-slate-400"
                >
                  {copiedBlock === 'auth' ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
                <pre className="text-xs text-slate-300 overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY
X-Tenant-ID: your-tenant-id`}
                </pre>
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Multi-tenancy:</strong> All requests must include the <code className="bg-amber-100 px-1 rounded">X-Tenant-ID</code> header. 
                  Row-level security ensures complete tenant isolation.
                </p>
              </div>
            </section>

            {/* Endpoints */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
                <Globe size={18} className="text-emerald-600" />
                {activeSection} Endpoints
              </h2>
              <div className="space-y-2">
                {endpoints[activeSection].map((endpoint, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 flex-1">{endpoint.path}</code>
                    <span className="text-xs text-gray-500 hidden sm:inline">{endpoint.desc}</span>
                    {endpoint.auth && <Lock size={12} className="text-gray-400" />}
                  </div>
                ))}
              </div>
            </section>

            {/* Code Examples */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Quick Start Examples</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Apply for a Loan</h3>
                  <div className="bg-slate-900 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyCode(codeExamples.apply, 'apply')}
                      className="absolute top-3 right-3 p-1.5 rounded hover:bg-slate-700 text-slate-400"
                    >
                      {copiedBlock === 'apply' ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                    <pre className="text-xs text-slate-300 overflow-x-auto">{codeExamples.apply}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">M-Pesa STK Push</h3>
                  <div className="bg-slate-900 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyCode(codeExamples.stkPush, 'stk')}
                      className="absolute top-3 right-3 p-1.5 rounded hover:bg-slate-700 text-slate-400"
                    >
                      {copiedBlock === 'stk' ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                    <pre className="text-xs text-slate-300 overflow-x-auto">{codeExamples.stkPush}</pre>
                  </div>
                </div>

                <div id="webhooks">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Webhook size={14} /> Webhook Handler
                  </h3>
                  <div className="bg-slate-900 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyCode(codeExamples.webhook, 'webhook')}
                      className="absolute top-3 right-3 p-1.5 rounded hover:bg-slate-700 text-slate-400"
                    >
                      {copiedBlock === 'webhook' ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                    <pre className="text-xs text-slate-300 overflow-x-auto">{codeExamples.webhook}</pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Limits</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Tier</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Requests/min</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Burst</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-2">Free</td><td className="px-4 py-2">60</td><td className="px-4 py-2">10</td></tr>
                    <tr><td className="px-4 py-2">Starter</td><td className="px-4 py-2">300</td><td className="px-4 py-2">50</td></tr>
                    <tr><td className="px-4 py-2">Growth</td><td className="px-4 py-2">1,000</td><td className="px-4 py-2">200</td></tr>
                    <tr><td className="px-4 py-2">Enterprise</td><td className="px-4 py-2">5,000</td><td className="px-4 py-2">1,000</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Error Codes */}
            <section id="errors" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Error Codes</h2>
              <div className="space-y-2">
                {[
                  { code: 400, name: 'Bad Request', desc: 'Invalid request parameters' },
                  { code: 401, name: 'Unauthorized', desc: 'Missing or invalid API key' },
                  { code: 403, name: 'Forbidden', desc: 'Insufficient permissions or tenant isolation violation' },
                  { code: 404, name: 'Not Found', desc: 'Resource not found' },
                  { code: 409, name: 'Conflict', desc: 'Resource already exists or state conflict' },
                  { code: 422, name: 'Compliance Block', desc: 'Request blocked by compliance rules (in duplum, cooling-off, consent)' },
                  { code: 429, name: 'Rate Limited', desc: 'Too many requests' },
                  { code: 500, name: 'Internal Error', desc: 'Server error — contact support' },
                ].map(err => (
                  <div key={err.code} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      err.code < 400 ? 'bg-green-100 text-green-700' :
                      err.code < 500 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {err.code}
                    </span>
                    <span className="text-sm font-medium text-gray-900 w-32">{err.name}</span>
                    <span className="text-xs text-gray-500">{err.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Compliance Notes */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-emerald-900">Compliance Enforcement</h2>
              </div>
              <p className="text-sm text-emerald-800 mb-3">
                All API endpoints enforce compliance rules at the platform level. These cannot be bypassed:
              </p>
              <ul className="space-y-1.5 text-xs text-emerald-700">
                <li>• <strong>In duplum rule:</strong> Loans capped at 2× principal — further charges auto-blocked</li>
                <li>• <strong>Cooling-off:</strong> 24-hour reflection period before first disbursement</li>
                <li>• <strong>Consent:</strong> All data operations require explicit, granular consent</li>
                <li>• <strong>KFS:</strong> Key Facts Statement must be accepted before loan activation</li>
                <li>• <strong>Audit:</strong> Every API call logged with hash chain for tamper evidence</li>
                <li>• <strong>Collections:</strong> Contact limits, permitted hours, and template-only messaging enforced</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
