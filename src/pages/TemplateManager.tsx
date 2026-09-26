import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { FileText, Plus, Edit2, Trash2, Eye, Copy, XCircle, CheckCircle } from 'lucide-react';

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email';
  category: 'reminder' | 'confirmation' | 'collection' | 'notification' | 'marketing' | 'other';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsed?: string;
}

export default function TemplateManager() {
  const { db, mutate, audit } = useDB();
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  // Mock templates
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([
    {
      id: 'TPL-001',
      name: 'Payment Reminder',
      type: 'sms',
      category: 'reminder',
      content: 'Dear {borrower_name}, your loan payment of KES {amount} is due on {due_date}. Please pay to avoid penalties. Paybill: 247247, Account: {loan_id}',
      variables: ['borrower_name', 'amount', 'due_date', 'loan_id'],
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      usageCount: 1247,
      lastUsed: '2026-02-19T10:30:00Z',
    },
    {
      id: 'TPL-002',
      name: 'Loan Approved',
      type: 'sms',
      category: 'confirmation',
      content: 'Congratulations {borrower_name}! Your loan of KES {amount} has been approved. Funds will be disbursed to {phone} within 24 hours after cooling-off period.',
      variables: ['borrower_name', 'amount', 'phone'],
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      usageCount: 892,
      lastUsed: '2026-02-19T09:15:00Z',
    },
    {
      id: 'TPL-003',
      name: 'Overdue Notice',
      type: 'sms',
      category: 'collection',
      content: 'Dear {borrower_name}, your loan payment of KES {amount} is {days_overdue} days overdue. Please pay immediately to avoid further penalties and credit bureau reporting.',
      variables: ['borrower_name', 'amount', 'days_overdue'],
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      usageCount: 456,
      lastUsed: '2026-02-19T11:45:00Z',
    },
    {
      id: 'TPL-004',
      name: 'Welcome Email',
      type: 'email',
      category: 'notification',
      subject: 'Welcome to Mika Lenders!',
      content: 'Dear {borrower_name},\n\nWelcome to Mika Lenders! Your account has been successfully created.\n\nAccount Details:\n- Phone: {phone}\n- Account ID: {borrower_id}\n\nYou can now apply for loans through our platform.\n\nBest regards,\nMika Lenders Team',
      variables: ['borrower_name', 'phone', 'borrower_id'],
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      usageCount: 892,
      lastUsed: '2026-02-19T08:00:00Z',
    },
    {
      id: 'TPL-005',
      name: 'Payment Confirmation',
      type: 'sms',
      category: 'confirmation',
      content: 'Thank you {borrower_name}! We have received your payment of KES {amount}. Remaining balance: KES {balance}. Transaction ref: {transaction_id}',
      variables: ['borrower_name', 'amount', 'balance', 'transaction_id'],
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      usageCount: 2156,
      lastUsed: '2026-02-19T14:20:00Z',
    },
  ]);

  const handleCreateTemplate = (templateData: Partial<CommunicationTemplate>) => {
    const newTemplate: CommunicationTemplate = {
      id: `TPL-${Date.now()}`,
      name: templateData.name || '',
      type: templateData.type || 'sms',
      category: templateData.category || 'other',
      subject: templateData.subject,
      content: templateData.content || '',
      variables: templateData.variables || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    setTemplates([...templates, newTemplate]);
    setShowCreateModal(false);
    audit('TEMPLATE_CREATED', 'Template', newTemplate.id, `Created template: ${newTemplate.name}`);
  };

  const handleUpdateTemplate = (templateId: string, updates: Partial<CommunicationTemplate>) => {
    setTemplates(templates.map(t => 
      t.id === templateId 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    ));
    audit('TEMPLATE_UPDATED', 'Template', templateId, 'Template updated');
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setTemplates(templates.filter(t => t.id !== templateId));
    audit('TEMPLATE_DELETED', 'Template', templateId, 'Template deleted');
  };

  const handleToggleActive = (templateId: string) => {
    setTemplates(templates.map(t => 
      t.id === templateId 
        ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString() }
        : t
    ));
  };

  const handlePreview = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, string> = {};
    template.variables.forEach(v => {
      initialData[v] = `{${v}}`;
    });
    setPreviewData(initialData);
    setShowPreviewModal(true);
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  };

  const getPreviewContent = () => {
    if (!selectedTemplate) return '';
    let content = selectedTemplate.content;
    Object.entries(previewData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return content;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Templates</h1>
          <p className="text-gray-600 mt-1">
            Manage SMS and email templates for borrower communications
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Compliance Requirement</p>
            <p>
              All borrower communications must use pre-approved templates. Free-text messaging is not permitted 
              per DLAK Code of Conduct. Templates must be reviewed and approved by compliance before use.
            </p>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {templates.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No templates found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {templates.map(template => (
              <div key={template.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        template.type === 'sms' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {template.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{template.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(template.id)}
                      className={`p-2 rounded-lg ${template.isActive ? 'hover:bg-red-100' : 'hover:bg-green-100'}`}
                      title={template.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {template.isActive ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-700 font-mono line-clamp-2">{template.content}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Variables: {template.variables.length}</span>
                    <span>Used: {template.usageCount} times</span>
                    {template.lastUsed && (
                      <span>Last used: {new Date(template.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                  <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Template Preview</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Variables</label>
                <div className="grid grid-cols-2 gap-3">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable}>
                      <label className="block text-xs text-gray-600 mb-1">{variable}</label>
                      <input
                        type="text"
                        value={previewData[variable] || ''}
                        onChange={(e) => setPreviewData({ ...previewData, [variable]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={`Enter ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">{getPreviewContent()}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onCreate={handleCreateTemplate}
          onClose={() => setShowCreateModal(false)}
          extractVariables={extractVariables}
        />
      )}

      {/* Edit Modal */}
      {selectedTemplate && !showPreviewModal && !showCreateModal && (
        <EditTemplateModal
          template={selectedTemplate}
          onUpdate={handleUpdateTemplate}
          onClose={() => setSelectedTemplate(null)}
          extractVariables={extractVariables}
        />
      )}
    </div>
  );
}

function CreateTemplateModal({ onCreate, onClose, extractVariables }: any) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms' as 'sms' | 'email',
    category: 'reminder',
    subject: '',
    content: '',
  });

  const variables = extractVariables(formData.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      variables,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Template</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="reminder">Reminder</option>
                <option value="confirmation">Confirmation</option>
                <option value="collection">Collection</option>
                <option value="notification">Notification</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {formData.type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              placeholder="Use {variable_name} for dynamic content"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{variable_name}'} for dynamic content. Detected variables: {variables.join(', ') || 'none'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
            >
              Create Template
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

function EditTemplateModal({ template, onUpdate, onClose, extractVariables }: any) {
  const [formData, setFormData] = useState({
    name: template.name,
    type: template.type,
    category: template.category,
    subject: template.subject || '',
    content: template.content,
  });

  const variables = extractVariables(formData.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(template.id, {
      ...formData,
      variables,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Template</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="reminder">Reminder</option>
                <option value="confirmation">Confirmation</option>
                <option value="collection">Collection</option>
                <option value="notification">Notification</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {formData.type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Detected variables: {variables.join(', ') || 'none'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
            >
              Update Template
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
