import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './components/NotificationProvider';
import { LanguageProvider } from './i18n/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import CommandPalette from './components/CommandPalette';
import GlobalSearch from './components/GlobalSearch';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import QuickActions from './components/QuickActions';

// Lazy load heavy components
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Loans = lazy(() => import('./pages/Loans'));
const Collections = lazy(() => import('./pages/Collections'));
const Products = lazy(() => import('./pages/Products'));
const Compliance = lazy(() => import('./pages/Compliance'));
const Reports = lazy(() => import('./pages/Reports'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Settings = lazy(() => import('./pages/Settings'));
const DatabaseConsole = lazy(() => import('./pages/DatabaseConsole'));
const BorrowerApp = lazy(() => import('./pages/borrower/BorrowerApp'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const TenantManagement = lazy(() => import('./pages/platform/TenantManagement'));
const ComplianceReports = lazy(() => import('./pages/compliance/ComplianceReports'));
const LoanSimulator = lazy(() => import('./pages/tools/LoanSimulator'));
const AuditLogExplorer = lazy(() => import('./pages/AuditLogExplorer'));
const WebhookManagement = lazy(() => import('./pages/WebhookManagement'));
const DataExport = lazy(() => import('./pages/DataExport'));
const RoleBasedAccessDemo = lazy(() => import('./pages/RoleBasedAccessDemo'));
const BulkImport = lazy(() => import('./pages/BulkImport'));
const PerformanceMonitoring = lazy(() => import('./pages/PerformanceMonitoring'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const ApiPlayground = lazy(() => import('./pages/ApiPlayground'));
const DocumentManagement = lazy(() => import('./pages/DocumentManagement'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'));
const FraudDetection = lazy(() => import('./pages/FraudDetection'));
const TemplateManager = lazy(() => import('./pages/TemplateManager'));
const RegulatoryCalendar = lazy(() => import('./pages/RegulatoryCalendar'));
const CommissionTracking = lazy(() => import('./pages/CommissionTracking'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <DataProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/app/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/app/loans" element={<Layout><Loans /></Layout>} />
                <Route path="/app/collections" element={<Layout><Collections /></Layout>} />
                <Route path="/app/products" element={<Layout><Products /></Layout>} />
                <Route path="/app/compliance" element={<Layout><Compliance /></Layout>} />
                <Route path="/app/compliance/audit" element={<Layout><AuditLogExplorer /></Layout>} />
                <Route path="/app/reports" element={<Layout><Reports /></Layout>} />
                <Route path="/app/integrations" element={<Layout><Integrations /></Layout>} />
                <Route path="/app/integrations/webhooks" element={<Layout><WebhookManagement /></Layout>} />
                <Route path="/app/settings" element={<Layout><Settings /></Layout>} />
                <Route path="/app/database" element={<Layout><DatabaseConsole /></Layout>} />
                <Route path="/platform/tenants" element={<Layout><TenantManagement /></Layout>} />
                <Route path="/compliance/reports" element={<Layout><ComplianceReports /></Layout>} />
                <Route path="/tools/simulator" element={<Layout><LoanSimulator /></Layout>} />
                <Route path="/app/data-export" element={<Layout><DataExport /></Layout>} />
                <Route path="/app/roles" element={<Layout><RoleBasedAccessDemo /></Layout>} />
                <Route path="/app/bulk-import" element={<Layout><BulkImport /></Layout>} />
                <Route path="/app/monitoring" element={<Layout><PerformanceMonitoring /></Layout>} />
                <Route path="/app/analytics" element={<Layout><AdvancedAnalytics /></Layout>} />
                <Route path="/app/api-playground" element={<Layout><ApiPlayground /></Layout>} />
                <Route path="/app/documents" element={<Layout><DocumentManagement /></Layout>} />
                <Route path="/app/support" element={<Layout><CustomerSupport /></Layout>} />
                <Route path="/app/fraud" element={<Layout><FraudDetection /></Layout>} />
                <Route path="/app/templates" element={<Layout><TemplateManager /></Layout>} />
                <Route path="/app/regulatory-calendar" element={<Layout><RegulatoryCalendar /></Layout>} />
                <Route path="/app/commissions" element={<Layout><CommissionTracking /></Layout>} />
                <Route path="/borrower" element={<BorrowerApp />} />
                <Route path="/docs/api" element={<ApiDocs />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <CommandPalette />
            <GlobalSearch />
            <KeyboardShortcuts />
            <QuickActions />
          </BrowserRouter>          </NotificationProvider>
        </DataProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
