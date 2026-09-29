import React, { useState } from 'react';
import { Webhook, Plus, Edit2, Trash2, TestTube, CheckCircle, XCircle, Clock, Copy, ExternalLink } from 'lucide-react';
import { useWebhooks } from '../hooks/useWebhooks';

interface WebhookEvent {
  id: string;
  event: string;
  description: string;
}

const AVAILABLE_EVENTS: WebhookEvent[] = [
  { id: 'loan.applied', event: 'loan.applied', description: 'Triggered when a new loan application is submitted' },
  { id: 'loan.approved', event: 'loan.approved', description: 'Triggered when a loan is approved' },
  { id: 'loan.rejected', event: 'loan.rejected', description: 'Triggered when a loan is rejected' },
  { id: 'loan.disbursed', event: 'loan.disbursed', description: 'Triggered when funds are disbursed to borrower' },
  { id: 'loan.repaid', event: 'loan.repaid', description: 'Triggered when a repayment is received' },
  { id: 'loan.overdue', event: 'loan.overdue', description: 'Triggered when a loan becomes overdue' },
  { id: 'borrower.registered', event: 'borrower.registered', description: 'Triggered when a new borrower registers' },
  { id: 'borrower.kyc_verified', event: 'borrower.kyc_verified', description: 'Triggered when borrower KYC is verified' },
  { id: 'consent.granted', event: 'consent.granted', description: 'Triggered when borrower grants consent' },
  { id: 'consent.withdrawn', event: 'consent.withdrawn', description: 'Triggered when borrower withdraws consent' },
  { id: 'compliance.alert', event: 'compliance.alert', description: 'Triggered when a compliance alert is raised' },
  { id: 'mpesa.transaction', event: 'mpesa.transaction', description: 'Triggered for all M-Pesa transactions' },
];

export default function WebhookManagement() {
  const { webhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhooks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const handleCreate = (webhookData: any) => {
    createWebhook(webhookData);
    setShowCreateModal(false);
  };

  const handleUpdate = (webhookData: any) => {
    if (editingWebhook) {
      updateWebhook(editingWebhook.id, webhookData);
      setEditingWebhook(null);
    }
  };

  const handleTest = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    await testWebhook(webhookId);
    setTimeout(() => setTestingWebhook(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Webhook className="h-7 w-7" />
            Webhook Management
          </h1>
          <p className="text-gray-600 mt-1">
            Configure event subscriptions to receive real-time notifications
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Webhook
        </button>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Webhook className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks configured</h3>
          <p className="text-gray-600 mb-4">
            Create your first webhook to start receiving event notifications
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Webhook
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {webhook.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        webhook.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {webhook.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <ExternalLink className="h-4 w-4" />
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(webhook.url)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event: string) => (
                      <span
                        key={event}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleTest(webhook.id)}
                    disabled={testingWebhook === webhook.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Test webhook"
                  >
                    {testingWebhook === webhook.id ? (
                      <Clock className="h-5 w-5 animate-spin" />
                    ) : (
                      <TestTube className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingWebhook(webhook)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit webhook"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this webhook?')) {
                        deleteWebhook(webhook.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete webhook"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Webhook Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Deliveries</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {webhook.stats.totalDeliveries}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {webhook.stats.successRate}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Delivery</div>
                  <div className="text-sm font-medium text-gray-900">
                    {webhook.stats.lastDelivery
                      ? new Date(webhook.stats.lastDelivery).toLocaleString()
                      : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingWebhook) && (
        <WebhookFormModal
          webhook={editingWebhook}
          events={AVAILABLE_EVENTS}
          onSave={editingWebhook ? handleUpdate : handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWebhook(null);
          }}
        />
      )}
    </div>
  );
}

interface WebhookFormModalProps {
  webhook?: any;
  events: WebhookEvent[];
  onSave: (data: any) => void;
  onClose: () => void;
}

function WebhookFormModal({ webhook, events, onSave, onClose }: WebhookFormModalProps) {
  const [name, setName] = useState(webhook?.name || '');
  const [url, setUrl] = useState(webhook?.url || '');
  const [secret, setSecret] = useState(webhook?.secret || '');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(webhook?.events || []);
  const [active, setActive] = useState(webhook?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      url,
      secret,
      events: selectedEvents,
      active,
    });
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {webhook ? 'Edit Webhook' : 'Create Webhook'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Production Notifications"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="https://your-app.com/webhooks/lendingos"
              />
            </div>

            {/* Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signing Secret (Optional)
              </label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                placeholder="Leave empty for no signature verification"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used to verify webhook payloads are from LendingOS
              </p>
            </div>

            {/* Events */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Events to Subscribe
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.event)}
                      onChange={() => toggleEvent(event.event)}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {event.event}
                      </div>
                      <div className="text-xs text-gray-600">
                        {event.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedEvents.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Please select at least one event
                </p>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Active</div>
                <div className="text-xs text-gray-600">
                  Webhook will receive events when active
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  active ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedEvents.length === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {webhook ? 'Update Webhook' : 'Create Webhook'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
