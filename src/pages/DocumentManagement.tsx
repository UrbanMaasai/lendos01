import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { Upload, FileText, CheckCircle, XCircle, Clock, Eye, Download, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  borrowerId: string;
  type: 'national_id' | 'passport' | 'driving_license' | 'payslip' | 'bank_statement' | 'utility_bill' | 'other';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  expiryDate?: string;
}

export default function DocumentManagement() {
  const { db, mutate, audit } = useDB();
  const [selectedBorrower, setSelectedBorrower] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Mock documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'DOC-001',
      borrowerId: 'BR-001',
      type: 'national_id',
      fileName: 'john_doe_id_front.jpg',
      fileSize: 245678,
      uploadedAt: '2026-02-15T10:30:00Z',
      status: 'verified',
      verifiedAt: '2026-02-15T11:00:00Z',
      verifiedBy: 'U-ADMIN',
    },
    {
      id: 'DOC-002',
      borrowerId: 'BR-001',
      type: 'payslip',
      fileName: 'john_doe_payslip_feb2026.pdf',
      fileSize: 567890,
      uploadedAt: '2026-02-16T14:20:00Z',
      status: 'verified',
      verifiedAt: '2026-02-16T15:00:00Z',
      verifiedBy: 'U-ADMIN',
    },
    {
      id: 'DOC-003',
      borrowerId: 'BR-002',
      type: 'national_id',
      fileName: 'jane_smith_id.jpg',
      fileSize: 345678,
      uploadedAt: '2026-02-17T09:15:00Z',
      status: 'pending',
    },
    {
      id: 'DOC-004',
      borrowerId: 'BR-003',
      type: 'bank_statement',
      fileName: 'peter_bank_statement.pdf',
      fileSize: 890123,
      uploadedAt: '2026-02-18T16:45:00Z',
      status: 'rejected',
      rejectionReason: 'Statement older than 3 months',
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: Document['type']) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBorrower) return;

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      const newDoc: Document = {
        id: `DOC-${Date.now()}`,
        borrowerId: selectedBorrower,
        type,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
      };

      setDocuments([...documents, newDoc]);
      setUploading(false);
      audit('DOCUMENT_UPLOADED', 'Document', newDoc.id, `Uploaded ${file.name} for borrower ${selectedBorrower}`);
    }, 1500);
  };

  const handleVerify = (docId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === docId 
        ? { 
            ...doc, 
            status: 'verified' as const, 
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'U-ADMIN'
          }
        : doc
    ));
    audit('DOCUMENT_VERIFIED', 'Document', docId, 'Document verified');
  };

  const handleReject = (docId: string, reason: string) => {
    setDocuments(documents.map(doc => 
      doc.id === docId 
        ? { 
            ...doc, 
            status: 'rejected' as const, 
            rejectionReason: reason 
          }
        : doc
    ));
    audit('DOCUMENT_REJECTED', 'Document', docId, `Rejected: ${reason}`);
  };

  const handleDelete = (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setDocuments(documents.filter(doc => doc.id !== docId));
    audit('DOCUMENT_DELETED', 'Document', docId, 'Document deleted');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-50 border-green-200 text-green-700';
      case 'rejected': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      national_id: 'National ID',
      passport: 'Passport',
      driving_license: 'Driving License',
      payslip: 'Payslip',
      bank_statement: 'Bank Statement',
      utility_bill: 'Utility Bill',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const borrowerDocuments = selectedBorrower 
    ? documents.filter(doc => doc.borrowerId === selectedBorrower)
    : documents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600 mt-1">
          Upload, verify, and manage KYC documents
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Borrower</label>
            <select
              value={selectedBorrower}
              onChange={(e) => setSelectedBorrower(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Borrowers</option>
              {db?.borrowers.map(borrower => (
                <option key={borrower.id} value={borrower.id}>
                  {borrower.firstName} {borrower.lastName} ({borrower.phone})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {selectedBorrower && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'national_id' as const, label: 'National ID' },
              { type: 'payslip' as const, label: 'Payslip' },
              { type: 'bank_statement' as const, label: 'Bank Statement' },
              { type: 'utility_bill' as const, label: 'Utility Bill' },
              { type: 'passport' as const, label: 'Passport' },
              { type: 'other' as const, label: 'Other' },
            ].map(docType => (
              <label
                key={docType.type}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 mb-1">{docType.label}</span>
                <span className="text-xs text-gray-500">Click to upload</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, docType.type)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            ))}
          </div>
          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
              <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Documents {selectedBorrower && `(${borrowerDocuments.length})`}
        </h2>

        {borrowerDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {borrowerDocuments.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{doc.fileName}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{getDocumentTypeLabel(doc.type)}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      {doc.verifiedAt && (
                        <span>Verified: {new Date(doc.verifiedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-gray-600" />
                  </button>
                  {doc.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVerify(doc.id)}
                        className="p-2 hover:bg-green-100 rounded-lg"
                        title="Verify"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) handleReject(doc.id, reason);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{previewDoc.fileName}</h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">Document preview not available in demo</p>
                <p className="text-xs text-gray-500 mt-2">
                  In production, this would show the actual document image/PDF
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{getDocumentTypeLabel(previewDoc.type)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="ml-2 font-medium">{formatFileSize(previewDoc.fileSize)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="ml-2 font-medium">{new Date(previewDoc.uploadedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium capitalize">{previewDoc.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
