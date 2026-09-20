import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './components/NotificationProvider';
import { LanguageProvider } from './i18n/LanguageContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Collections from './pages/Collections';
import Products from './pages/Products';
import Compliance from './pages/Compliance';
import Reports from './pages/Reports';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import DatabaseConsole from './pages/DatabaseConsole';
import BorrowerApp from './pages/borrower/BorrowerApp';
import ApiDocs from './pages/ApiDocs';
import TenantManagement from './pages/platform/TenantManagement';
import ComplianceReports from './pages/compliance/ComplianceReports';
import LoanSimulator from './pages/tools/LoanSimulator';
import AuditLogExplorer from './pages/AuditLogExplorer';
import WebhookManagement from './pages/WebhookManagement';
import DataExport from './pages/DataExport';
import RoleBasedAccessDemo from './pages/RoleBasedAccessDemo';
import BulkImport from './pages/BulkImport';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import ApiPlayground from './pages/ApiPlayground';
import DocumentManagement from './pages/DocumentManagement';
import CommandPalette from './components/CommandPalette';

function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <NotificationProvider>
          <BrowserRouter>
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
            <Route path="/borrower" element={<BorrowerApp />} />
            <Route path="/docs/api" element={<ApiDocs />} />
            <Route path="*" element={<Navigate to="/" replace />} />            </Routes>
            <CommandPalette />
          </BrowserRouter>
        </NotificationProvider>
      </DataProvider>
    </LanguageProvider>
  );
}

export default App;
