import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Map routes to breadcrumb labels
const routeMap: Record<string, string> = {
  '/app': 'App',
  '/app/dashboard': 'Dashboard',
  '/app/loans': 'Loans',
  '/app/collections': 'Collections',
  '/app/products': 'Products',
  '/app/compliance': 'Compliance',
  '/app/compliance/audit': 'Audit Log',
  '/app/reports': 'Reports',
  '/app/integrations': 'Integrations',
  '/app/integrations/webhooks': 'Webhooks',
  '/app/settings': 'Settings',
  '/app/database': 'Database',
  '/app/data-export': 'Data Export',
  '/app/bulk-import': 'Bulk Import',
  '/app/monitoring': 'Monitoring',
  '/app/analytics': 'Analytics',
  '/app/api-playground': 'API Playground',
  '/app/documents': 'Documents',
  '/app/support': 'Support',
  '/app/fraud': 'Fraud Detection',
  '/app/templates': 'Templates',
  '/app/regulatory-calendar': 'Regulatory Calendar',
  '/app/commissions': 'Commissions',
  '/app/roles': 'Role-Based Access',
  '/platform/tenants': 'Tenant Management',
  '/compliance/reports': 'Compliance Reports',
  '/tools/simulator': 'Loan Simulator',
  '/borrower': 'Borrower App',
  '/docs/api': 'API Docs',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on landing page or login
  if (pathnames.length === 0) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/app/dashboard' },
  ];

  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    
    const label = routeMap[currentPath];
    if (label) {
      const isLast = index === pathnames.length - 1;
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
      });
    }
  });

  // If no breadcrumbs found, just show home
  if (breadcrumbs.length === 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={index} className="flex items-center">
            {index === 0 && (
              <Home className="h-4 w-4 text-gray-400 mr-1" />
            )}
            
            {breadcrumb.path ? (
              <Link
                to={breadcrumb.path}
                className="hover:text-emerald-600 transition-colors"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">
                {breadcrumb.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
