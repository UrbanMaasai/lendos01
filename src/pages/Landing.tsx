import { Link } from 'react-router-dom';
import { Shield, Zap, CheckCircle, ArrowRight, Building2, Users, Globe, Lock, Package, Phone } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl text-gray-900">LendingOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#compliance" className="text-sm text-gray-600 hover:text-gray-900">Compliance</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#integrations" className="text-sm text-gray-600 hover:text-gray-900">Integrations</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign In</Link>
            <Link to="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-300 text-sm font-medium">CBK Compliant • DLAK Certified</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Launch your digital lending business in{' '}
              <span className="text-emerald-400">30 days</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              The compliance-first lending platform for licensed Digital Credit Providers in Kenya. 
              M-Pesa native. Regulation-ready. White-label.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                Start Free Trial <ArrowRight size={18} />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 border border-slate-500 text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                See How It Works
              </a>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Free tier available
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Go live in 30 days
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-500 mt-1">Licensed DCPs Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">KES 2.1B</div>
              <div className="text-sm text-gray-500 mt-1">Loans Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-500 mt-1">Platform Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">&lt;5 min</div>
              <div className="text-sm text-gray-500 mt-1">Disbursement Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to lend digitally</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From product configuration to collections — one platform handles your entire lending lifecycle with compliance built in.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Package, title: 'Product Builder', desc: 'Configure loan products with no-code. Set amounts, rates, tenure, eligibility rules, and approval workflows.' },
              { icon: Shield, title: 'Compliance-by-Design', desc: 'Hard-coded conduct controls, in duplum enforcement, KFS generation, cooling-off periods, and consent management.' },
              { icon: Zap, title: 'M-Pesa Native', desc: 'Direct Daraja API integration. C2B repayments, B2C disbursements, STK Push — no aggregator middleman.' },
              { icon: Users, title: 'Decision Engine', desc: 'Scorecard-based risk assessment with CRB integration, affordability checks, and manual review queues.' },
              { icon: Phone, title: 'Ethical Collections', desc: 'DLAK-compliant collections with conduct hard-blocks. No contact list access, no third-party messaging, no shaming.' },
              { icon: Globe, title: 'White-Label Ready', desc: 'Custom branding, domain, and mobile PWA. Your borrowers see your brand, not ours.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <Lock size={14} />
                Non-Negotiable Hard-Blocks
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance isn't a feature. It's the foundation.</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Every LendingOS tenant is hard-blocked from violating borrower protection regulations. 
                These aren't soft controls that can be bypassed — they're enforced at the platform level.
              </p>
              <div className="space-y-4">
                {[
                  { code: 'CL-005', text: 'No contact list access — platform prevents phone contact scraping' },
                  { code: 'CL-006', text: 'No third-party messaging — SMS only to borrower, never family/employers' },
                  { code: 'CL-007', text: 'No social media shaming — no API for public debt disclosure' },
                  { code: 'CL-008', text: 'No threats/obscene language — only pre-approved SMS templates' },
                  { code: 'LS-005', text: 'In duplum rule — total recoverable hard-capped at 2× principal' },
                  { code: 'KFS-001', text: 'Key Facts Statement auto-generated before every application' },
                  { code: 'COP-001', text: 'Cooling-off period enforced before first disbursement' },
                  { code: 'CON-001', text: 'Granular, withdrawable consent with full audit trail' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 bg-slate-100 text-slate-700 text-xs font-mono px-2 py-0.5 rounded">{item.code}</span>
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-slate-400 ml-2">compliance-engine.ts</span>
              </div>
              <pre className="text-xs sm:text-sm text-slate-300 overflow-x-auto">
{`// Hard-block: In Duplum Rule (LS-005)
async function checkInDuplum(loan: Loan) {
  const maxRecoverable = loan.principal * 2;
  const totalCharged = loan.interest 
    + loan.fees + loan.penalties;
  
  if (totalCharged >= maxRecoverable) {
    // HARD BLOCK — cannot be overridden
    await blockFurtherCharges(loan.id);
    await auditLog({
      action: 'IN_DUPLUM_REACHED',
      severity: 'CRITICAL',
      overrideable: false,
    });
    return {
      blocked: true,
      message: "Maximum payable: KES " 
        + maxRecoverable.toLocaleString()
        + " (in duplum limit)"
    };
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Free', price: '0', period: '/month', features: ['50 active loans', '1 product', 'Platform branding', 'Sandbox M-Pesa', 'No API access'], cta: 'Start Free', popular: false },
              { name: 'Starter', price: '9,500', period: '/month', features: ['500 active loans', '3 products', 'Custom branding', 'Live M-Pesa (C2B+B2C)', 'Email support'], cta: 'Start Trial', popular: false },
              { name: 'Growth', price: '35,000', period: '/month', features: ['5,000 active loans', 'Unlimited products', 'Full white-label', 'STK Push + API', 'Priority support'], cta: 'Start Trial', popular: true },
              { name: 'Enterprise', price: '150,000+', period: '/month', features: ['Unlimited loans', 'Custom mobile apps', 'Dedicated manager', '24/7 support', 'Custom SLA'], cta: 'Contact Sales', popular: false },
            ].map((plan, i) => (
              <div key={i} className={`bg-white rounded-xl p-6 border ${plan.popular ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-3">Most Popular</div>
                )}
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">KES {plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrated with Kenya's financial ecosystem</h2>
            <p className="text-lg text-gray-600">M-Pesa native. CRB connected. KYC verified.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'M-Pesa Daraja', desc: 'Payments' },
              { name: 'Metropol CRB', desc: 'Credit Reports' },
              { name: 'TransUnion', desc: 'Credit Bureau' },
              { name: "Africa's Talking", desc: 'SMS Gateway' },
              { name: 'Smile Identity', desc: 'KYC Verification' },
              { name: 'AWS SES', desc: 'Email Service' },
            ].map((int, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border border-gray-200">
                  <Building2 size={20} className="text-gray-600" />
                </div>
                <div className="text-sm font-medium text-gray-900">{int.name}</div>
                <div className="text-xs text-gray-500">{int.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to launch your lending business?</h2>
          <p className="text-emerald-100 text-lg mb-8">
            Join 50+ licensed lenders already using LendingOS. Start your free trial today.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-white">LendingOS</span>
            </div>
            <p className="text-sm">© 2026 LendingOS. Compliance-first lending infrastructure for East Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
