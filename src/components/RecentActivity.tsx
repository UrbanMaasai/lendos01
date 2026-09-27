import { useState, useEffect } from 'react';
import { Activity, Clock, FileText, Users, DollarSign, AlertCircle, X } from 'lucide-react';
import { useDB } from '../contexts/DataContext';

interface ActivityItem {
  id: string;
  type: 'loan_created' | 'loan_approved' | 'loan_disbursed' | 'loan_repaid' | 'borrower_registered' | 'consent_given' | 'consent_withdrawn' | 'compliance_alert' | 'collection_contact';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

export default function RecentActivity() {
  const { db } = useDB();
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!db) return;

    // Generate recent activities from audit log
    const recentActivities: ActivityItem[] = [];

    // Get last 20 audit entries
    const recentLogs = [...db.auditLog]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    recentLogs.forEach(log => {
      let activity: ActivityItem | null = null;

      switch (log.action) {
        case 'LOAN_APPLIED':
          activity = {
            id: log.id,
            type: 'loan_created',
            title: 'New Loan Application',
            description: log.details,
            timestamp: log.timestamp,
            icon: FileText,
            color: 'text-blue-600 bg-blue-100',
          };
          break;
        case 'LOAN_APPROVED':
          activity = {
            id: log.id,
            type: 'loan_approved',
            title: 'Loan Approved',
            description: log.details,
            timestamp: log.timestamp,
            icon: FileText,
            color: 'text-green-600 bg-green-100',
          };
          break;
        case 'LOAN_DISBURSED':
          activity = {
            id: log.id,
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            description: log.details,
            timestamp: log.timestamp,
            icon: DollarSign,
            color: 'text-emerald-600 bg-emerald-100',
          };
          break;
        case 'REPAYMENT_RECEIVED':
          activity = {
            id: log.id,
            type: 'loan_repaid',
            title: 'Repayment Received',
            description: log.details,
            timestamp: log.timestamp,
            icon: DollarSign,
            color: 'text-green-600 bg-green-100',
          };
          break;
        case 'BORROWER_REGISTERED':
          activity = {
            id: log.id,
            type: 'borrower_registered',
            title: 'New Borrower Registered',
            description: log.details,
            timestamp: log.timestamp,
            icon: Users,
            color: 'text-purple-600 bg-purple-100',
          };
          break;
        case 'CONSENT_GRANTED':
          activity = {
            id: log.id,
            type: 'consent_given',
            title: 'Consent Granted',
            description: log.details,
            timestamp: log.timestamp,
            icon: Users,
            color: 'text-blue-600 bg-blue-100',
          };
          break;
        case 'CONSENT_WITHDRAWN':
          activity = {
            id: log.id,
            type: 'consent_withdrawn',
            title: 'Consent Withdrawn',
            description: log.details,
            timestamp: log.timestamp,
            icon: Users,
            color: 'text-orange-600 bg-orange-100',
          };
          break;
        case 'COMPLIANCE_ALERT':
          activity = {
            id: log.id,
            type: 'compliance_alert',
            title: 'Compliance Alert',
            description: log.details,
            timestamp: log.timestamp,
            icon: AlertCircle,
            color: 'text-red-600 bg-red-100',
          };
          break;
        case 'COLLECTION_CONTACT':
          activity = {
            id: log.id,
            type: 'collection_contact',
            title: 'Collection Contact',
            description: log.details,
            timestamp: log.timestamp,
            icon: Activity,
            color: 'text-amber-600 bg-amber-100',
          };
          break;
      }

      if (activity) {
        recentActivities.push(activity);
      }
    });

    setActivities(recentActivities);
  }, [db]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Activity Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Recent Activity"
      >
        <Activity size={20} className="text-gray-600" />
        {activities.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
            {activities.length > 9 ? '9+' : activities.length}
          </span>
        )}
      </button>

      {/* Activity Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Clock className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
              Showing last {activities.length} activities
            </div>
          </div>
        </div>
      )}
    </>
  );
}
