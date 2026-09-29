import { useState } from 'react';
import { Building2, Users, Palette, Shield, Globe, CreditCard } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('tenant');

  const sections = [
    { id: 'tenant', label: 'Tenant', icon: Building2 },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'domain', label: 'Domain', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your tenant configuration, users, and branding</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon size={16} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'tenant' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input type="text" defaultValue="Mika Lenders Ltd" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                  <div className="flex items-center">
                    <input type="text" defaultValue="mika" className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500">.lendingos.co.ke</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DCP License Number</label>
                  <input type="text" defaultValue="DCP/2025/0047" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                  <select defaultValue="growth" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="free">Free (KES 0/mo)</option>
                    <option value="starter">Starter (KES 9,500/mo)</option>
                    <option value="growth">Growth (KES 35,000/mo)</option>
                    <option value="enterprise">Enterprise (KES 150,000+/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input type="email" defaultValue="admin@mikalenders.co.ke" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" defaultValue="+254 712 345 678" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save Changes</button>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Users & Roles</h3>
                <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Invite User</button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Admin User', email: 'admin@mikalenders.co.ke', role: 'Admin', status: 'Active' },
                  { name: 'Jane Collections', email: 'jane@mikalenders.co.ke', role: 'Collections', status: 'Active' },
                  { name: 'Mark Otieno', email: 'mark@mikalenders.co.ke', role: 'Credit Officer', status: 'Active' },
                  { name: 'Sarah Compliance', email: 'sarah@mikalenders.co.ke', role: 'Compliance', status: 'Active' },
                  { name: 'David Loans', email: 'david@mikalenders.co.ke', role: 'Loan Admin', status: 'Active' },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium text-emerald-700">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">{user.role}</span>
                      <span className="text-xs text-green-600">{user.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>5 default roles:</strong> Admin, Credit Officer, Loan Admin, Collections, Compliance. 
                  All users must have MFA enabled.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl mx-auto flex items-center justify-center mb-2">
                      <span className="text-emerald-600 font-bold text-2xl">M</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG or SVG, max 2MB</p>
                    <button className="text-xs text-emerald-600 font-medium mt-2">Upload new logo</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg border-2 border-gray-200" />
                      <div>
                        <div className="text-sm text-gray-900">Primary Color</div>
                        <input type="text" defaultValue="#059669" className="text-xs text-gray-500 font-mono border border-gray-200 rounded px-2 py-1 mt-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg border-2 border-gray-200" />
                      <div>
                        <div className="text-sm text-gray-900">Secondary Color</div>
                        <input type="text" defaultValue="#0f172a" className="text-xs text-gray-500 font-mono border border-gray-200 rounded px-2 py-1 mt-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Preview (changes reflected in &lt;60 seconds)</p>
                <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="font-semibold text-slate-900">Mika Lenders</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save Branding</button>
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Configuration</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Cooling-off period (hours)', value: '24', description: 'Time before first disbursement' },
                    { label: 'Max contacts per borrower per day', value: '3', description: 'All channels combined' },
                    { label: 'Permitted contact hours', value: '07:00 - 20:00', description: 'Local time only' },
                    { label: 'Complaint escalation threshold', value: '3/month', description: 'Triggers platform compliance review' },
                    { label: 'Auto-approve threshold (KES)', value: '5,000', description: 'Above this requires manual review' },
                    { label: 'DTI maximum threshold', value: '50%', description: 'Auto-reject if exceeded' },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{setting.label}</div>
                        <div className="text-xs text-gray-500">{setting.description}</div>
                      </div>
                      <input 
                        type="text" 
                        defaultValue={setting.value}
                        className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save Settings</button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Some compliance settings (in duplum rule, KFS generation, consent requirements) 
                  are hard-coded and cannot be modified. These are enforced at the platform level.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'domain' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Domain</h3>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                <p className="text-sm text-emerald-800">
                  <strong>Growth tier feature:</strong> Configure a custom domain with automatic SSL provisioning.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                <input type="text" placeholder="loans.mikalenders.co.ke" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                <p className="text-xs text-gray-500 mt-1">Point your domain's CNAME record to: <code className="bg-gray-100 px-1 rounded">cname.lendingos.co.ke</code></p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">SSL Certificate</div>
                    <div className="text-xs text-green-600">Active — Auto-renewed</div>
                  </div>
                  <div className="text-xs text-gray-500">Expires: 2027-02-19</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div>
                    <div className="text-lg font-bold text-gray-900">Growth</div>
                    <div className="text-sm text-gray-600">KES 35,000/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Next billing</div>
                    <div className="text-sm font-medium text-gray-900">Mar 1, 2026</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active loans</span>
                    <span className="font-medium">1,247 / 5,000</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
                <div className="space-y-3">
                  {[
                    { item: 'Disbursements', count: '342', rate: 'KES 12 each', total: 'KES 4,104' },
                    { item: 'Repayments', count: '1,205', rate: 'KES 8 each', total: 'KES 9,640' },
                    { item: 'SMS Messages', count: '4,567', rate: 'KES 0.40 each', total: 'KES 1,827' },
                  ].map((usage, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{usage.item}</div>
                        <div className="text-xs text-gray-500">{usage.count} × {usage.rate}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{usage.total}</div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">Total Usage Fees</span>
                    <span className="text-sm font-bold text-gray-900">KES 15,571</span>
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
