import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, User, Filter } from 'lucide-react';

interface SupportTicket {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerPhone: string;
  subject: string;
  description: string;
  category: 'payment' | 'account' | 'loan' | 'complaint' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  slaDeadline: string;
  messages: Array<{
    id: string;
    sender: 'borrower' | 'agent';
    message: string;
    timestamp: string;
  }>;
}

export default function CustomerSupport() {
  const { db, mutate, audit } = useDB();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Mock tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-001',
      borrowerId: 'BR-001',
      borrowerName: 'James Mwangi',
      borrowerPhone: '+254712345678',
      subject: 'Payment not reflected',
      description: 'I made a payment yesterday but it\'s not showing in my account',
      category: 'payment',
      priority: 'high',
      status: 'in_progress',
      assignedTo: 'U-JANE',
      createdAt: '2026-02-18T10:30:00Z',
      updatedAt: '2026-02-18T14:20:00Z',
      slaDeadline: '2026-02-20T10:30:00Z',
      messages: [
        {
          id: 'MSG-001',
          sender: 'borrower',
          message: 'I made a payment of KES 5,000 yesterday via M-Pesa but it\'s not showing in my account. Transaction ref: QKJ8A7B6C5',
          timestamp: '2026-02-18T10:30:00Z',
        },
        {
          id: 'MSG-002',
          sender: 'agent',
          message: 'Thank you for contacting us. I\'m looking into this now and will get back to you shortly.',
          timestamp: '2026-02-18T14:20:00Z',
        },
      ],
    },
    {
      id: 'TKT-002',
      borrowerId: 'BR-002',
      borrowerName: 'Mary Wanjiku',
      borrowerPhone: '+254723456789',
      subject: 'Unable to login',
      description: 'I\'m getting an error when trying to login to the app',
      category: 'technical',
      priority: 'medium',
      status: 'open',
      createdAt: '2026-02-19T09:15:00Z',
      updatedAt: '2026-02-19T09:15:00Z',
      slaDeadline: '2026-02-21T09:15:00Z',
      messages: [
        {
          id: 'MSG-003',
          sender: 'borrower',
          message: 'I keep getting "Invalid credentials" error even though I\'m using the correct OTP. Please help.',
          timestamp: '2026-02-19T09:15:00Z',
        },
      ],
    },
    {
      id: 'TKT-003',
      borrowerId: 'BR-003',
      borrowerName: 'Peter Ochieng',
      borrowerPhone: '+254734567890',
      subject: 'Complaint about charges',
      description: 'I was charged penalty fees even though I paid on time',
      category: 'complaint',
      priority: 'urgent',
      status: 'open',
      createdAt: '2026-02-19T11:45:00Z',
      updatedAt: '2026-02-19T11:45:00Z',
      slaDeadline: '2026-02-20T11:45:00Z',
      messages: [
        {
          id: 'MSG-004',
          sender: 'borrower',
          message: 'I paid my loan on time but I\'ve been charged KES 500 in penalty fees. This is unfair and I want a refund immediately.',
          timestamp: '2026-02-19T11:45:00Z',
        },
      ],
    },
    {
      id: 'TKT-004',
      borrowerId: 'BR-004',
      borrowerName: 'Grace Akinyi',
      borrowerPhone: '+254745678901',
      subject: 'Request for loan extension',
      description: 'I need more time to repay my loan',
      category: 'loan',
      priority: 'medium',
      status: 'resolved',
      assignedTo: 'U-MARK',
      createdAt: '2026-02-17T14:00:00Z',
      updatedAt: '2026-02-18T10:00:00Z',
      resolvedAt: '2026-02-18T10:00:00Z',
      resolution: 'Loan restructured with 15-day extension. New due date: 2026-03-10',
      slaDeadline: '2026-02-19T14:00:00Z',
      messages: [
        {
          id: 'MSG-005',
          sender: 'borrower',
          message: 'Due to unexpected medical expenses, I need an extension on my loan repayment.',
          timestamp: '2026-02-17T14:00:00Z',
        },
        {
          id: 'MSG-006',
          sender: 'agent',
          message: 'We understand your situation. We\'ve approved a 15-day extension. Your new due date is March 10, 2026.',
          timestamp: '2026-02-18T10:00:00Z',
        },
      ],
    },
  ]);

  const handleCreateTicket = (ticketData: Partial<SupportTicket>) => {
    const newTicket: SupportTicket = {
      id: `TKT-${Date.now()}`,
      borrowerId: ticketData.borrowerId || '',
      borrowerName: ticketData.borrowerName || '',
      borrowerPhone: ticketData.borrowerPhone || '',
      subject: ticketData.subject || '',
      description: ticketData.description || '',
      category: ticketData.category || 'other',
      priority: ticketData.priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          sender: 'borrower',
          message: ticketData.description || '',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setTickets([...tickets, newTicket]);
    setShowCreateModal(false);
    audit('TICKET_CREATED', 'SupportTicket', newTicket.id, `New ticket: ${newTicket.subject}`);
  };

  const handleAddMessage = (ticketId: string, message: string) => {
    if (!message.trim()) return;

    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          messages: [
            ...ticket.messages,
            {
              id: `MSG-${Date.now()}`,
              sender: 'agent',
              message,
              timestamp: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    }));

    setNewMessage('');
    audit('TICKET_MESSAGE', 'SupportTicket', ticketId, 'Agent replied to ticket');
  };

  const handleResolveTicket = (ticketId: string, resolution: string) => {
    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: 'resolved',
          resolution,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    }));

    setSelectedTicket(null);
    audit('TICKET_RESOLVED', 'SupportTicket', ticketId, `Resolved: ${resolution}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'closed': return <CheckCircle className="h-5 w-5 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 border-red-200 text-red-700';
      case 'in_progress': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'resolved': return 'bg-green-50 border-green-200 text-green-700';
      case 'closed': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
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

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600 mt-1">
            Manage borrower inquiries and complaints
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Open</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
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
            <span className="text-sm text-gray-600">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Urgent</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{ticket.subject}</h3>
                      <p className="text-xs text-gray-500">{ticket.id} • {ticket.borrowerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Category: {ticket.category}</span>
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>SLA: {new Date(ticket.slaDeadline).toLocaleDateString()}</span>
                  {ticket.assignedTo && <span>Assigned: {ticket.assignedTo}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500">{selectedTicket.id} • {selectedTicket.borrowerName} ({selectedTicket.borrowerPhone})</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">Category: {selectedTicket.category}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {selectedTicket.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === 'agent'
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {msg.sender === 'agent' ? 'Support Agent' : selectedTicket.borrowerName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? (
                <div className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddMessage(selectedTicket.id, newMessage)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                    >
                      Send Reply
                    </button>
                    <button
                      onClick={() => {
                        const resolution = prompt('Resolution notes:');
                        if (resolution) handleResolveTicket(selectedTicket.id, resolution);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Resolve Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900 mb-1">Ticket Resolved</p>
                  <p className="text-sm text-green-800">{selectedTicket.resolution}</p>
                  <p className="text-xs text-green-700 mt-2">
                    Resolved on {new Date(selectedTicket.resolvedAt!).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          borrowers={db?.borrowers || []}
          onCreate={handleCreateTicket}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function CreateTicketModal({ borrowers, onCreate, onClose }: any) {
  const [formData, setFormData] = useState({
    borrowerId: '',
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const borrower = borrowers.find((b: any) => b.id === formData.borrowerId);
    onCreate({
      ...formData,
      borrowerName: borrower ? `${borrower.firstName} ${borrower.lastName}` : '',
      borrowerPhone: borrower?.phone || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrower</label>
            <select
              value={formData.borrowerId}
              onChange={(e) => setFormData({ ...formData, borrowerId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select borrower...</option>
              {borrowers.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.firstName} {b.lastName} ({b.phone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="payment">Payment Issue</option>
              <option value="account">Account Issue</option>
              <option value="loan">Loan Inquiry</option>
              <option value="complaint">Complaint</option>
              <option value="technical">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
            >
              Create Ticket
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
