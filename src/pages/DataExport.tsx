import { useState } from 'react';
import { useDB } from '../contexts/DataContext';
import { exportToCSV, exportToJSON } from '../utils/export';
import { Download, FileText, Users, DollarSign, Shield, Activity, Database } from 'lucide-react';

export default function DataExport() {
  const { db } = useDB();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (entity: string, format: 'csv' | 'json') => {
    if (!db) return;
    
    setExporting(entity);
    
    setTimeout(() => {
      let data: any[] = [];
      let filename = '';

      switch (entity) {
        case 'loans':
          data = db.loans.map(loan => ({
            id: loan.id,
            borrowerId: loan.borrowerId,
            productId: loan.productId,
            principal: loan.principal,
            interestRate: loan.interestRate,
            totalRepayable: loan.totalRepayable,
            amountPaid: loan.amountPaid,
            balance: loan.balance,
            status: loan.status,
            appliedAt: loan.appliedAt,
            disbursedAt: loan.disbursedAt || '',
            dueDate: loan.dueDate,
            daysPastDue: loan.daysPastDue,
            inDuplumReached: loan.inDuplumReached,
            kfsAcceptedAt: loan.kfsAcceptedAt || '',
          }));
          filename = `loans_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'borrowers':
          data = db.borrowers.map(borrower => ({
            id: borrower.id,
            phone: borrower.phone,
            firstName: borrower.firstName,
            lastName: borrower.lastName,
            idNumber: borrower.idNumber,
            kycStatus: borrower.kycStatus,
            kycVerifiedAt: borrower.kycVerifiedAt || '',
            creditScore: borrower.creditScore || '',
            monthlyIncome: borrower.monthlyIncome || '',
            employmentStatus: borrower.employmentStatus || '',
            createdAt: borrower.createdAt,
          }));
          filename = `borrowers_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'products':
          data = db.products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            minAmount: product.minAmount,
            maxAmount: product.maxAmount,
            interestRate: product.interestRate,
            interestMethod: product.interestMethod,
            tenureDays: product.tenureDays,
            apr: product.apr,
            status: product.status,
            autoApproveThreshold: product.autoApproveThreshold,
          }));
          filename = `products_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'transactions':
          data = db.mpesaTransactions.map(txn => ({
            id: txn.id,
            loanId: txn.loanId || '',
            type: txn.type,
            amount: txn.amount,
            phone: txn.phone,
            reference: txn.reference,
            mpesaReceipt: txn.mpesaReceipt || '',
            status: txn.status,
            requestAt: txn.requestAt,
            completedAt: txn.completedAt || '',
          }));
          filename = `transactions_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'audit':
          data = db.auditLog.map(entry => ({
            id: entry.id,
            timestamp: entry.timestamp,
            userId: entry.userId,
            userName: entry.userName,
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            details: entry.details,
            ipAddress: entry.ipAddress,
            hash: entry.hash,
          }));
          filename = `audit_log_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'alerts':
          data = db.alerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            resolved: alert.resolved,
            createdAt: alert.createdAt,
            resolvedAt: alert.resolvedAt || '',
          }));
          filename = `compliance_alerts_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'collections':
          data = db.collectionCases.map(c => ({
            id: c.id,
            loanId: c.loanId,
            borrowerId: c.borrowerId,
            amountDue: c.amountDue,
            daysPastDue: c.daysPastDue,
            bucket: c.bucket,
            status: c.status,
            contactsToday: c.contactsToday,
            lastContactAt: c.lastContactAt || '',
            assignedTo: c.assignedTo,
          }));
          filename = `collections_${new Date().toISOString().split('T')[0]}`;
          break;
      }

      if (format === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToJSON(data, filename);
      }

      setExporting(null);
    }, 500);
  };

  const exportOptions = [
    {
      id: 'loans',
      name: 'Loans',
      description: 'All loan applications and active loans',
      icon: FileText,
      count: db?.loans.length || 0,
      color: 'blue',
    },
    {
      id: 'borrowers',
      name: 'Borrowers',
      description: 'All registered borrowers with KYC status',
      icon: Users,
      count: db?.borrowers.length || 0,
      color: 'green',
    },
    {
      id: 'products',
      name: 'Products',
      description: 'All loan products and configurations',
      icon: DollarSign,
      count: db?.products.length || 0,
      color: 'purple',
    },
    {
      id: 'transactions',
      name: 'M-Pesa Transactions',
      description: 'All disbursements and repayments',
      icon: DollarSign,
      count: db?.mpesaTransactions.length || 0,
      color: 'emerald',
    },
    {
      id: 'audit',
      name: 'Audit Log',
      description: 'Complete audit trail (7-year retention)',
      icon: Shield,
      count: db?.auditLog.length || 0,
      color: 'orange',
    },
    {
      id: 'alerts',
      name: 'Compliance Alerts',
      description: 'All compliance alerts and violations',
      icon: Activity,
      count: db?.alerts.length || 0,
      color: 'red',
    },
    {
      id: 'collections',
      name: 'Collections Cases',
      description: 'All collection cases and contacts',
      icon: Database,
      count: db?.collectionCases.length || 0,
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
        <p className="text-gray-600 mt-1">
          Export data for compliance reporting, analysis, and backup
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Compliance Note</p>
            <p>
              All exports include complete audit trails and are logged. Audit logs must be retained for 7 years 
              per CBK regulations. Exported data should be stored securely and access should be restricted.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isExporting = exporting === option.id;

          return (
            <div
              key={option.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                  <Icon className={`h-6 w-6 text-${option.color}-600`} />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {option.count} records
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {option.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {option.description}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExport(option.id, 'csv')}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      CSV
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleExport(option.id, 'json')}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      JSON
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>All exports are logged in the audit trail for compliance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>CSV format is recommended for spreadsheet analysis and regulatory reporting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>JSON format is recommended for system integration and backup</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>Audit logs must be retained for 7 years per CBK regulations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>Exported data containing PII should be encrypted and access-restricted</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>For large datasets, consider using the API for batch exports</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
