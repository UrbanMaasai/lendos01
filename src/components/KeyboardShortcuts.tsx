import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['⌘', 'K'], description: 'Open global search', category: 'Navigation' },
  { keys: ['⌘', '⇧', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['⌘', '⇧', 'L'], description: 'Go to Loans', category: 'Navigation' },
  { keys: ['⌘', '⇧', 'C'], description: 'Go to Collections', category: 'Navigation' },
  { keys: ['⌘', '⇧', 'P'], description: 'Go to Products', category: 'Navigation' },
  { keys: ['⌘', '⇧', 'S'], description: 'Go to Settings', category: 'Navigation' },
  
  // Actions
  { keys: ['⌘', 'N'], description: 'Create new loan', category: 'Actions' },
  { keys: ['⌘', 'E'], description: 'Export data', category: 'Actions' },
  { keys: ['⌘', 'R'], description: 'Refresh data', category: 'Actions' },
  
  // View
  { keys: ['⌘', '⇧', 'B'], description: 'Toggle sidebar', category: 'View' },
  { keys: ['⌘', '⇧', 'T'], description: 'Toggle theme', category: 'View' },
  
  // Help
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
  { keys: ['Esc'], description: 'Close modal/panel', category: 'Help' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with ? key
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Keyboard className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">?</kbd> to toggle this panel • <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
