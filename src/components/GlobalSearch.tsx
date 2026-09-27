import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Users, Package, AlertCircle } from 'lucide-react';
import { useDB } from '../contexts/DataContext';

interface SearchResult {
  id: string;
  type: 'loan' | 'borrower' | 'product' | 'alert';
  title: string;
  subtitle: string;
  route: string;
  icon: React.ElementType;
}

export default function GlobalSearch() {
  const { db } = useDB();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search across all entities
  useEffect(() => {
    if (!query || !db) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search loans
    db.loans.forEach(loan => {
      const borrower = db.borrowers.find(b => b.id === loan.borrowerId);
      const borrowerName = borrower ? `${borrower.firstName} ${borrower.lastName}` : 'Unknown';
      
      if (
        loan.id.toLowerCase().includes(searchQuery) ||
        borrowerName.toLowerCase().includes(searchQuery) ||
        borrower?.phone.toLowerCase().includes(searchQuery) ||
        loan.status.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: loan.id,
          type: 'loan',
          title: `Loan ${loan.id}`,
          subtitle: `${borrowerName} • KES ${loan.principal.toLocaleString()} • ${loan.status}`,
          route: '/app/loans',
          icon: FileText,
        });
      }
    });

    // Search borrowers
    db.borrowers.forEach(borrower => {
      const fullName = `${borrower.firstName} ${borrower.lastName}`;
      
      if (
        fullName.toLowerCase().includes(searchQuery) ||
        borrower.phone.toLowerCase().includes(searchQuery) ||
        borrower.idNumber.toLowerCase().includes(searchQuery) ||
        borrower.id.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: borrower.id,
          type: 'borrower',
          title: fullName,
          subtitle: `${borrower.phone} • ${borrower.kycStatus} • ID: ${borrower.idNumber}`,
          route: '/app/loans',
          icon: Users,
        });
      }
    });

    // Search products
    db.products.forEach(product => {
      if (
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.id.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `KES ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()} • ${product.interestRate}%`,
          route: '/app/products',
          icon: Package,
        });
      }
    });

    // Search alerts
    db.alerts.forEach(alert => {
      if (
        alert.title.toLowerCase().includes(searchQuery) ||
        alert.description.toLowerCase().includes(searchQuery) ||
        alert.type.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: alert.id,
          type: 'alert',
          title: alert.title,
          subtitle: `${alert.severity} • ${alert.type} • ${alert.resolved ? 'Resolved' : 'Active'}`,
          route: '/app/compliance',
          icon: AlertCircle,
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [query, db]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search loans, borrowers, products, alerts..."
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

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              {query ? 'No results found' : 'Start typing to search...'}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs text-gray-400 capitalize">
                        {result.type}
                      </span>
                    </div>
                  </button>
                );
              })}
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
            <span>⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
