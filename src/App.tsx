import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
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

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/app/loans" element={<Layout><Loans /></Layout>} />
          <Route path="/app/collections" element={<Layout><Collections /></Layout>} />
          <Route path="/app/products" element={<Layout><Products /></Layout>} />
          <Route path="/app/compliance" element={<Layout><Compliance /></Layout>} />
          <Route path="/app/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/app/integrations" element={<Layout><Integrations /></Layout>} />
          <Route path="/app/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/app/database" element={<Layout><DatabaseConsole /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
