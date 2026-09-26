import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut to open (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View portfolio overview',
      action: () => { navigate('/app/dashboard'); setIsOpen(false); },
      keywords: ['home', 'overview', 'portfolio'],
    },
    {
      id: 'nav-loans',
      label: 'Go to Loans',
      description: 'Manage loan applications',
      action: () => { navigate('/app/loans'); setIsOpen(false); },
      keywords: ['applications', 'active'],
    },
    {
      id: 'nav-collections',
      label: 'Go to Collections',
      description: 'View collection cases',
      action: () => { navigate('/app/collections'); setIsOpen(false); },
      keywords: ['overdue', 'recovery'],
    },
    {
      id: 'nav-products',
      label: 'Go to Products',
      description: 'Configure loan products',
      action: () => { navigate('/app/products'); setIsOpen(false); },
      keywords: ['configure', 'settings'],
    },
    {
      id: 'nav-compliance',
      label: 'Go to Compliance',
      description: 'View compliance dashboard',
      action: () => { navigate('/app/compliance'); setIsOpen(false); },
      keywords: ['regulatory', 'audit'],
    },
    {
      id: 'nav-reports',
      label: 'Go to Reports',
      description: 'View analytics and reports',
      action: () => { navigate('/app/reports'); setIsOpen(false); },
      keywords: ['analytics', 'metrics'],
    },
    {
      id: 'nav-audit',
      label: 'Go to Audit Log',
      description: 'Search audit trail',
      action: () => { navigate('/app/compliance/audit'); setIsOpen(false); },
      keywords: ['trail', 'history'],
    },
    {
      id: 'nav-webhooks',
      label: 'Go to Webhooks',
      description: 'Manage integrations',
      action: () => { navigate('/app/integrations/webhooks'); setIsOpen(false); },
      keywords: ['integrations', 'api'],
    },
    {
      id: 'nav-database',
      label: 'Go to Database Console',
      description: 'Backend simulator',
      action: () => { navigate('/app/database'); setIsOpen(false); },
      keywords: ['backend', 'simulator'],
    },
    {
      id: 'nav-tenants',
      label: 'Go to Tenant Management',
      description: 'Manage lenders',
      action: () => { navigate('/platform/tenants'); setIsOpen(false); },
      keywords: ['admin', 'platform'],
    },
    {
      id: 'nav-borrower',
      label: 'Open Borrower App',
      description: 'Test borrower experience',
      action: () => { navigate('/borrower'); setIsOpen(false); },
      keywords: ['customer', 'mobile'],
    },
    {
      id: 'nav-api',
      label: 'View API Documentation',
      description: 'Developer reference',
      action: () => { navigate('/docs/api'); setIsOpen(false); },
      keywords: ['developers', 'reference'],
    },
    // Actions
    {
      id: 'action-export',
      label: 'Export Data',
      description: 'Download CSV or JSON',
      action: () => { navigate('/app/data-export'); setIsOpen(false); },
      keywords: ['download', 'csv', 'json'],
    },
    {
      id: 'action-simulator',
      label: 'Open Loan Simulator',
      description: 'Calculate loan costs',
      action: () => { navigate('/tools/simulator'); setIsOpen(false); },
      keywords: ['calculator', 'cost'],
    },
    {
      id: 'action-reports',
      label: 'Generate Compliance Report',
      description: 'CBK, ODPC, DLAK reports',
      action: () => { navigate('/compliance/reports'); setIsOpen(false); },
      keywords: ['cbk', 'odpc', 'dlak', 'regulatory'],
    },
  ];

  // Filter commands based on search query
  const filteredCommands = commands.filter(cmd => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const searchText = `${cmd.label} ${cmd.description || ''} ${(cmd.keywords || []).join(' ')}`.toLowerCase();
    
    return searchText.includes(query);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 text-base outline-none placeholder:text-gray-400"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                >
                  {cmd.icon && <div className="flex-shrink-0">{cmd.icon}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {cmd.label}
                    </div>
                    {cmd.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">esc</kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
