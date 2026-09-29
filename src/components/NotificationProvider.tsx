import { useState, useEffect } from 'react';
import { useDB } from '../contexts/DataContext';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { db } = useDB();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  // Watch for compliance alerts
  useEffect(() => {
    if (!db) return;

    const unresolvedAlerts = db.alerts.filter((a: any) => !a.resolved);
    
    // Create notifications for new alerts
    unresolvedAlerts.forEach((alert: any) => {
      const exists = notifications.find(n => n.id === `alert-${alert.id}`);
      if (!exists) {
        const newNotification: Notification = {
          id: `alert-${alert.id}`,
          type: alert.severity === 'critical' || alert.severity === 'high' ? 'error' : 
                alert.severity === 'medium' ? 'warning' : 'info',
          title: alert.title,
          message: alert.description,
          timestamp: new Date(alert.createdAt).getTime(),
          read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
      }
    });
  }, [db?.alerts]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'error': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <>
      {children}
      
      {/* Notification Bell */}
      <div className="fixed top-20 right-6 z-40">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
        >
          <Bell size={20} className="text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed top-32 right-6 z-40 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-gray-200 rounded">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                          >
                            <X size={14} className="text-gray-400" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-2 ml-8"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
