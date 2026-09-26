import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, Bell } from 'lucide-react';

interface RegulatoryEvent {
  id: string;
  title: string;
  type: 'filing' | 'audit' | 'report' | 'renewal' | 'training' | 'other';
  regulator: 'CBK' | 'ODPC' | 'DLAK' | 'KRA' | 'Internal';
  dueDate: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  description: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderDays: number;
  completedAt?: string;
  notes?: string;
}

export default function RegulatoryCalendar() {
  const { db, mutate, audit } = useDB();
  const [selectedEvent, setSelectedEvent] = useState<RegulatoryEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterRegulator, setFilterRegulator] = useState<string>('all');

  // Mock regulatory events
  const [events, setEvents] = useState<RegulatoryEvent[]>([
    {
      id: 'REG-001',
      title: 'CBK Monthly Return - February 2026',
      type: 'filing',
      regulator: 'CBK',
      dueDate: '2026-03-15',
      status: 'upcoming',
      description: 'Submit monthly regulatory return to Central Bank of Kenya including loan portfolio, PAR, and compliance metrics',
      assignedTo: 'U-SARAH',
      priority: 'high',
      reminderDays: 7,
    },
    {
      id: 'REG-002',
      title: 'ODPC Data Protection Audit',
      type: 'audit',
      regulator: 'ODPC',
      dueDate: '2026-03-31',
      status: 'upcoming',
      description: 'Annual data protection compliance audit by Office of the Data Protection Commissioner',
      assignedTo: 'U-SARAH',
      priority: 'urgent',
      reminderDays: 14,
    },
    {
      id: 'REG-003',
      title: 'DLAK Code of Conduct Self-Assessment - Q1',
      type: 'report',
      regulator: 'DLAK',
      dueDate: '2026-03-31',
      status: 'upcoming',
      description: 'Quarterly self-assessment of compliance with DLAK Code of Conduct for Digital Lenders',
      assignedTo: 'U-SARAH',
      priority: 'high',
      reminderDays: 10,
    },
    {
      id: 'REG-004',
      title: 'DCP License Renewal',
      type: 'renewal',
      regulator: 'CBK',
      dueDate: '2026-06-30',
      status: 'upcoming',
      description: 'Annual renewal of Digital Credit Provider license with Central Bank of Kenya',
      assignedTo: 'U-ADMIN',
      priority: 'urgent',
      reminderDays: 60,
    },
    {
      id: 'REG-005',
      title: 'KRA VAT Return - February 2026',
      type: 'filing',
      regulator: 'KRA',
      dueDate: '2026-03-20',
      status: 'upcoming',
      description: 'Monthly VAT return filing with Kenya Revenue Authority',
      assignedTo: 'U-ADMIN',
      priority: 'medium',
      reminderDays: 5,
    },
    {
      id: 'REG-006',
      title: 'CBK Monthly Return - January 2026',
      type: 'filing',
      regulator: 'CBK',
      dueDate: '2026-02-15',
      status: 'completed',
      description: 'Monthly regulatory return submitted successfully',
      assignedTo: 'U-SARAH',
      priority: 'high',
      reminderDays: 7,
      completedAt: '2026-02-14T16:30:00Z',
      notes: 'Filed on time. All metrics within acceptable ranges.',
    },
    {
      id: 'REG-007',
      title: 'Staff Compliance Training - AML/KYC',
      type: 'training',
      regulator: 'Internal',
      dueDate: '2026-02-28',
      status: 'in_progress',
      description: 'Quarterly anti-money laundering and KYC training for all staff',
      assignedTo: 'U-SARAH',
      priority: 'medium',
      reminderDays: 3,
    },
    {
      id: 'REG-008',
      title: 'DLAK Code of Conduct Self-Assessment - Q4 2025',
      type: 'report',
      regulator: 'DLAK',
      dueDate: '2026-01-31',
      status: 'overdue',
      description: 'Quarterly self-assessment - OVERDUE',
      assignedTo: 'U-SARAH',
      priority: 'urgent',
      reminderDays: 10,
    },
  ]);

  const handleMarkComplete = (eventId: string, notes?: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          notes,
        };
      }
      return event;
    }));

    setSelectedEvent(null);
    audit('REGULATORY_EVENT_COMPLETED', 'RegulatoryEvent', eventId, `Completed: ${notes || 'No notes'}`);
  };

  const handleStartEvent = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, status: 'in_progress' as const }
        : event
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRegulatorColor = (regulator: string) => {
    switch (regulator) {
      case 'CBK': return 'bg-purple-100 text-purple-700';
      case 'ODPC': return 'bg-indigo-100 text-indigo-700';
      case 'DLAK': return 'bg-pink-100 text-pink-700';
      case 'KRA': return 'bg-teal-100 text-teal-700';
      case 'Internal': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredEvents = filterRegulator === 'all' 
    ? events 
    : events.filter(e => e.regulator === filterRegulator);

  const stats = {
    upcoming: events.filter(e => e.status === 'upcoming').length,
    inProgress: events.filter(e => e.status === 'in_progress').length,
    completed: events.filter(e => e.status === 'completed').length,
    overdue: events.filter(e => e.status === 'overdue').length,
  };

  const upcomingEvents = events
    .filter(e => e.status === 'upcoming' || e.status === 'in_progress')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regulatory Calendar</h1>
          <p className="text-gray-600 mt-1">
            Track regulatory filings, audits, and compliance deadlines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              viewMode === 'calendar' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Upcoming</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map(event => {
              const daysUntil = Math.ceil((new Date(event.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={event.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(event.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    daysUntil <= 7 ? 'bg-red-100 text-red-700' :
                    daysUntil <= 14 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {daysUntil} days
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter by regulator:</span>
          <select
            value={filterRegulator}
            onChange={(e) => setFilterRegulator(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Regulators</option>
            <option value="CBK">CBK</option>
            <option value="ODPC">ODPC</option>
            <option value="DLAK">DLAK</option>
            <option value="KRA">KRA</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No regulatory events found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-xs text-gray-500">{event.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRegulatorColor(event.regulator)}`}>
                      {event.regulator}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Due: {new Date(event.dueDate).toLocaleDateString()}</span>
                    <span>Type: {event.type}</span>
                    {event.assignedTo && <span>Assigned: {event.assignedTo}</span>}
                  </div>
                  {event.completedAt && (
                    <span>Completed: {new Date(event.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  <p className="text-sm text-gray-500">{selectedEvent.id}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRegulatorColor(selectedEvent.regulator)}`}>
                  {selectedEvent.regulator}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                  {selectedEvent.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Due Date</h3>
                  <p className="text-sm text-gray-700">{new Date(selectedEvent.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Type</h3>
                  <p className="text-sm text-gray-700 capitalize">{selectedEvent.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Assigned To</h3>
                  <p className="text-sm text-gray-700">{selectedEvent.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Reminder</h3>
                  <p className="text-sm text-gray-700">{selectedEvent.reminderDays} days before</p>
                </div>
              </div>

              {selectedEvent.status === 'completed' && selectedEvent.notes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Completion Notes</h3>
                  <p className="text-sm text-green-800">{selectedEvent.notes}</p>
                  <p className="text-xs text-green-700 mt-2">
                    Completed on {new Date(selectedEvent.completedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              {(selectedEvent.status === 'upcoming' || selectedEvent.status === 'overdue') && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStartEvent(selectedEvent.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Start Working
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Completion notes:');
                      if (notes !== null) handleMarkComplete(selectedEvent.id, notes);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Mark Complete
                  </button>
                </div>
              )}

              {selectedEvent.status === 'in_progress' && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const notes = prompt('Completion notes:');
                      if (notes !== null) handleMarkComplete(selectedEvent.id, notes);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
