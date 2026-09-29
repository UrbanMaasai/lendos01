import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Users, DollarSign, AlertCircle, X } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  route: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'new-loan',
    label: 'New Loan',
    icon: FileText,
    color: 'bg-blue-500 hover:bg-blue-600',
    route: '/app/loans',
    description: 'Create a new loan application',
  },
  {
    id: 'new-borrower',
    label: 'New Borrower',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
    route: '/app/loans',
    description: 'Register a new borrower',
  },
  {
    id: 'disburse',
    label: 'Disburse',
    icon: DollarSign,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    route: '/app/loans',
    description: 'Disburse an approved loan',
  },
  {
    id: 'report',
    label: 'Report',
    icon: AlertCircle,
    color: 'bg-amber-500 hover:bg-amber-600',
    route: '/compliance/reports',
    description: 'Generate compliance report',
  },
];

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: QuickAction) => {
    navigate(action.route);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isOpen
              ? 'bg-gray-700 hover:bg-gray-800 rotate-45'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          title="Quick Actions"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Action Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="py-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
