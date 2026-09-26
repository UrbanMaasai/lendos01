import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Phone, Package, Shield, BarChart3, 
  Plug, Settings, ChevronLeft, ChevronRight, Bell, Search,
  Menu, LogOut, User, Users, Database, Smartphone, BookOpen
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Loans', href: '/app/loans', icon: FileText },
  { name: 'Collections', href: '/app/collections', icon: Phone },
  { name: 'Products', href: '/app/products', icon: Package },
  { name: 'Documents', href: '/app/documents', icon: FileText },
  { name: 'Compliance', href: '/app/compliance', icon: Shield },
  { name: 'Audit Log', href: '/app/compliance/audit', icon: Shield },
  { name: 'Reports', href: '/app/reports', icon: BarChart3 },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Compliance Reports', href: '/compliance/reports', icon: FileText },
  { name: 'Loan Simulator', href: '/tools/simulator', icon: BarChart3 },
  { name: 'Data Export', href: '/app/data-export', icon: BarChart3 },
  { name: 'Bulk Import', href: '/app/bulk-import', icon: BarChart3 },
  { name: 'Monitoring', href: '/app/monitoring', icon: BarChart3 },
  { name: 'API Playground', href: '/app/api-playground', icon: BookOpen },
  { name: 'Customer Support', href: '/app/support', icon: Phone },
  { name: 'Fraud Detection', href: '/app/fraud', icon: Shield },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Regulatory Calendar', href: '/app/regulatory-calendar', icon: BarChart3 },
  { name: 'Commissions', href: '/app/commissions', icon: BarChart3 },
  { name: 'Role-Based Access', href: '/app/roles', icon: Users },
  { name: 'Integrations', href: '/app/integrations', icon: Plug },
  { name: 'Webhooks', href: '/app/integrations/webhooks', icon: Plug },
  { name: 'Database', href: '/app/database', icon: Database },
  { name: 'Tenant Management', href: '/platform/tenants', icon: Database },
  { name: 'Borrower App', href: '/borrower', icon: Smartphone },
  { name: 'API Docs', href: '/docs/api', icon: BookOpen },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-30`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-sm">L</div>
              <span className="font-bold text-lg">LendingOS</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-slate-700">
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">Mika Lenders</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 text-white p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-sm">L</div>
                <span className="font-bold text-lg">LendingOS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <ChevronLeft size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded hover:bg-gray-100">
                <Menu size={20} />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
                <Search size={16} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search loans, borrowers..." 
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                M-Pesa Connected
              </div>
              <LanguageSwitcher />
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <LogOut size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
