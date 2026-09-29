import { useState } from 'react';
import { Shield, Users, FileText, DollarSign, AlertTriangle, Settings, Eye } from 'lucide-react';

type UserRole = 'admin' | 'credit_officer' | 'collections' | 'compliance';

interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  permissions: string[];
  dashboard: {
    stats: Array<{ label: string; value: string; change?: string }>;
    quickActions: string[];
    recentActivity: string[];
  };
}

const roles: RoleConfig[] = [
  {
    id: 'admin',
    name: 'Platform Admin',
    description: 'Full access to all features and settings',
    icon: Shield,
    color: 'purple',
    permissions: [
      'View all loans and borrowers',
      'Configure products and pricing',
      'Manage users and roles',
      'Access compliance reports',
      'View audit logs',
      'Manage integrations',
      'Configure webhooks',
      'Export all data',
    ],
    dashboard: {
      stats: [
        { label: 'Total Portfolio', value: 'KES 45.8M', change: '+8.7%' },
        { label: 'Active Loans', value: '1,247', change: '+45' },
        { label: 'PAR 30', value: '8.2%', change: '+0.4%' },
        { label: 'Compliance Score', value: '98%', change: '+2%' },
      ],
      quickActions: ['Create Product', 'Add User', 'Generate Report', 'View Audit Log'],
      recentActivity: [
        'Product "Salary Advance" updated by Admin',
        'New user "Jane Collections" added',
        'Webhook endpoint configured',
        'Compliance report generated',
      ],
    },
  },
  {
    id: 'credit_officer',
    name: 'Credit Officer',
    description: 'Manage loan applications and decisions',
    icon: FileText,
    color: 'blue',
    permissions: [
      'View loan applications',
      'Run decision engine',
      'Approve/reject loans',
      'View borrower profiles',
      'Access credit reports',
      'View product configurations',
    ],
    dashboard: {
      stats: [
        { label: 'Pending Applications', value: '89', change: '+12' },
        { label: 'Approved Today', value: '23', change: '+5' },
        { label: 'Approval Rate', value: '67.3%', change: '+2.1%' },
        { label: 'Avg Processing Time', value: '4m 32s', change: '-15s' },
      ],
      quickActions: ['Review Applications', 'Run Decision', 'View Borrower', 'Credit Report'],
      recentActivity: [
        'Application LN-008 approved',
        'Decision engine run for LN-009',
        'Credit report pulled for BR-045',
        'Borrower KYC verified',
      ],
    },
  },
  {
    id: 'collections',
    name: 'Collections Agent',
    description: 'Manage overdue loans and recoveries',
    icon: DollarSign,
    color: 'orange',
    permissions: [
      'View collection cases',
      'Contact borrowers (compliant)',
      'Log promise-to-pay',
      'View repayment history',
      'Access contact templates',
      'View delinquency buckets',
    ],
    dashboard: {
      stats: [
        { label: 'Active Cases', value: '156', change: '+8' },
        { label: 'PTP Today', value: '12', change: '+3' },
        { label: 'Recovery Rate', value: '72%', change: '+5%' },
        { label: 'Avg Days to Resolve', value: '18', change: '-2' },
      ],
      quickActions: ['View Queue', 'Contact Borrower', 'Log PTP', 'View Templates'],
      recentActivity: [
        'PTP logged for LN-005: KES 14,000 by Feb 25',
        'SMS sent to BR-003 (reminder)',
        'Case CC-002 escalated',
        'Payment received: LN-003',
      ],
    },
  },
  {
    id: 'compliance',
    name: 'Compliance Officer',
    description: 'Monitor regulatory compliance and audits',
    icon: AlertTriangle,
    color: 'red',
    permissions: [
      'View all audit logs',
      'Access compliance alerts',
      'Generate regulatory reports',
      'View consent records',
      'Monitor conduct violations',
      'Export audit data',
    ],
    dashboard: {
      stats: [
        { label: 'Active Alerts', value: '5', change: '-2' },
        { label: 'Audit Entries (7d)', value: '12,847', change: '+1,234' },
        { label: 'Consent Withdrawals', value: '3', change: '+1' },
        { label: 'Conduct Violations', value: '0', change: '0' },
      ],
      quickActions: ['View Alerts', 'Audit Log', 'Generate Report', 'Consent Records'],
      recentActivity: [
        'Alert CA-001 resolved: In duplum reached',
        'Audit log exported for CBK report',
        'Consent withdrawn by BR-045',
        'DLAK compliance report generated',
      ],
    },
  },
];

export default function RoleBasedAccessDemo() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const currentRole = roles.find(r => r.id === selectedRole)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h1>
        <p className="text-gray-600 mt-1">
          Demo different user roles and their access levels
        </p>
      </div>

      {/* Role Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? `border-${role.color}-500 bg-${role.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`inline-flex p-2 rounded-lg bg-${role.color}-100 mb-3`}>
                  <Icon className={`h-6 w-6 text-${role.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Permissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions
          </h2>
          <ul className="space-y-2">
            {currentRole.permissions.map((permission, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Eye className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dashboard Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard View</h2>
            <div className="grid grid-cols-2 gap-4">
              {currentRole.dashboard.stats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  {stat.change && (
                    <div className="text-xs text-green-600 mt-1">{stat.change}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {currentRole.dashboard.quickActions.map((action, index) => (
                <button
                  key={index}
                  className="px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium text-left"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              {currentRole.dashboard.recentActivity.map((activity, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-gray-700">{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">About Role-Based Access Control</p>
            <p>
              LendingOS implements granular role-based access control (RBAC) to ensure users only see 
              and interact with data relevant to their responsibilities. Each role has specific permissions 
              that determine which features, data, and actions are available. This demo shows how different 
              roles experience the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
