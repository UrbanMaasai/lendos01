// ============================================================================
// LendingOS Database Seed — Initial data for demo
// ============================================================================
import type { Database, Tenant, User, Borrower, BorrowerConsent, LoanProduct, Loan, CollectionCase, ComplianceAlert, Complaint } from './schema';
import { sha256 } from './services';

const CURRENT_TENANT = 'T-MIKA-001';

export async function createSeedData(): Promise<Database> {
  const now = new Date().toISOString();
  const genesisHash = await sha256('GENESIS-' + now);
  
  const tenant: Tenant = {
    id: CURRENT_TENANT,
    name: 'Mika Lenders Ltd',
    subdomain: 'mika',
    tier: 'growth',
    activeLoans: 1247,
    maxLoans: 5000,
    primaryColor: '#059669',
    paybillNumber: '247247',
    status: 'active',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: now,
  };
  
  const users: User[] = [
    { id: 'U-ADMIN', tenantId: CURRENT_TENANT, email: 'admin@mikalenders.co.ke', name: 'Admin User', role: 'admin', mfaEnabled: true, status: 'active', lastLogin: now, createdAt: '2025-11-01T00:00:00Z' },
    { id: 'U-JANE', tenantId: CURRENT_TENANT, email: 'jane@mikalenders.co.ke', name: 'Jane Collections', role: 'collections', mfaEnabled: true, status: 'active', createdAt: '2025-11-15T00:00:00Z' },
    { id: 'U-MARK', tenantId: CURRENT_TENANT, email: 'mark@mikalenders.co.ke', name: 'Mark Otieno', role: 'credit_officer', mfaEnabled: true, status: 'active', createdAt: '2025-11-15T00:00:00Z' },
    { id: 'U-SARAH', tenantId: CURRENT_TENANT, email: 'sarah@mikalenders.co.ke', name: 'Sarah Compliance', role: 'compliance', mfaEnabled: true, status: 'active', createdAt: '2025-11-20T00:00:00Z' },
    { id: 'U-DAVID', tenantId: CURRENT_TENANT, email: 'david@mikalenders.co.ke', name: 'David Loans', role: 'loan_admin', mfaEnabled: true, status: 'active', createdAt: '2025-12-01T00:00:00Z' },
  ];
  
  const borrowers: Borrower[] = [
    { id: 'BR-001', tenantId: CURRENT_TENANT, phone: '+254712345678', firstName: 'James', lastName: 'Mwangi', idNumber: '23456789', kycStatus: 'verified', kycVerifiedAt: '2025-12-01T00:00:00Z', creditScore: 720, monthlyIncome: 45000, employmentStatus: 'employed', createdAt: '2025-12-01T00:00:00Z' },
    { id: 'BR-002', tenantId: CURRENT_TENANT, phone: '+254723456789', firstName: 'Mary', lastName: 'Wanjiku', idNumber: '34567890', kycStatus: 'verified', kycVerifiedAt: '2025-12-05T00:00:00Z', creditScore: 680, monthlyIncome: 38000, employmentStatus: 'employed', createdAt: '2025-12-05T00:00:00Z' },
    { id: 'BR-003', tenantId: CURRENT_TENANT, phone: '+254734567890', firstName: 'Peter', lastName: 'Ochieng', idNumber: '45678901', kycStatus: 'verified', kycVerifiedAt: '2025-12-10T00:00:00Z', creditScore: 610, monthlyIncome: 28000, employmentStatus: 'employed', createdAt: '2025-12-10T00:00:00Z' },
    { id: 'BR-004', tenantId: CURRENT_TENANT, phone: '+254745678901', firstName: 'Grace', lastName: 'Akinyi', idNumber: '56789012', kycStatus: 'verified', kycVerifiedAt: '2026-01-05T00:00:00Z', creditScore: 650, monthlyIncome: 32000, employmentStatus: 'self_employed', createdAt: '2026-01-05T00:00:00Z' },
    { id: 'BR-005', tenantId: CURRENT_TENANT, phone: '+254756789012', firstName: 'David', lastName: 'Kamau', idNumber: '67890123', kycStatus: 'verified', kycVerifiedAt: '2025-11-20T00:00:00Z', creditScore: 580, monthlyIncome: 52000, employmentStatus: 'employed', createdAt: '2025-11-20T00:00:00Z' },
    { id: 'BR-006', tenantId: CURRENT_TENANT, phone: '+254767890123', firstName: 'Faith', lastName: 'Njeri', idNumber: '78901234', kycStatus: 'verified', kycVerifiedAt: '2026-02-15T00:00:00Z', creditScore: 690, monthlyIncome: 41000, employmentStatus: 'employed', createdAt: '2026-02-15T00:00:00Z' },
    { id: 'BR-007', tenantId: CURRENT_TENANT, phone: '+254778901234', firstName: 'Samuel', lastName: 'Kipchoge', idNumber: '89012345', kycStatus: 'verified', kycVerifiedAt: '2025-10-15T00:00:00Z', creditScore: 540, monthlyIncome: 25000, employmentStatus: 'self_employed', createdAt: '2025-10-15T00:00:00Z' },
    { id: 'BR-008', tenantId: CURRENT_TENANT, phone: '+254789012345', firstName: 'Lucy', lastName: 'Muthoni', idNumber: '90123456', kycStatus: 'verified', kycVerifiedAt: '2026-02-18T00:00:00Z', creditScore: 670, monthlyIncome: 35000, employmentStatus: 'employed', createdAt: '2026-02-18T00:00:00Z' },
  ];
  
  const consents: BorrowerConsent[] = borrowers.flatMap(b => [
    { id: `CON-${b.id}-CC`, borrowerId: b.id, tenantId: CURRENT_TENANT, consentType: 'credit_check', granted: true, grantedAt: b.kycVerifiedAt, consentVersion: '2.1' },
    { id: `CON-${b.id}-CR`, borrowerId: b.id, tenantId: CURRENT_TENANT, consentType: 'crb_reporting', granted: true, grantedAt: b.kycVerifiedAt, consentVersion: '2.1' },
    { id: `CON-${b.id}-DP`, borrowerId: b.id, tenantId: CURRENT_TENANT, consentType: 'data_processing', granted: true, grantedAt: b.kycVerifiedAt, consentVersion: '2.1' },
    { id: `CON-${b.id}-MK`, borrowerId: b.id, tenantId: CURRENT_TENANT, consentType: 'marketing', granted: b.id !== 'BR-004', grantedAt: b.kycVerifiedAt, withdrawnAt: b.id === 'BR-004' ? '2026-02-17T00:00:00Z' : undefined, consentVersion: '2.1' },
  ]);
  
  const products: LoanProduct[] = [
    {
      id: 'P-001', tenantId: CURRENT_TENANT, name: 'Salary Advance',
      description: 'Short-term salary advance for employed borrowers with verified income',
      minAmount: 5000, maxAmount: 25000, interestRate: 8, interestMethod: 'flat',
      tenureDays: 30, apr: 115.2, processingFee: 0, lateFee: 100, penaltyRatePerDay: 1,
      gracePeriodDays: 0, autoApproveThreshold: 5000, maxDti: 50, coolingOffHours: 24,
      status: 'active', approvedBy: 'U-ADMIN', approvedAt: '2025-11-10T00:00:00Z',
      createdAt: '2025-11-05T00:00:00Z', updatedAt: '2025-11-10T00:00:00Z',
    },
    {
      id: 'P-002', tenantId: CURRENT_TENANT, name: 'Micro Personal',
      description: 'Flexible personal loans for broader retail segment',
      minAmount: 5000, maxAmount: 50000, interestRate: 12, interestMethod: 'reducing',
      tenureDays: 60, apr: 175.2, processingFee: 200, lateFee: 200, penaltyRatePerDay: 1.5,
      gracePeriodDays: 3, autoApproveThreshold: 5000, maxDti: 50, coolingOffHours: 24,
      status: 'active', approvedBy: 'U-ADMIN', approvedAt: '2025-11-20T00:00:00Z',
      createdAt: '2025-11-15T00:00:00Z', updatedAt: '2025-11-20T00:00:00Z',
    },
    {
      id: 'P-003', tenantId: CURRENT_TENANT, name: 'First-Time Borrower',
      description: 'Controlled lending for thin-file borrowers with alternative data',
      minAmount: 2000, maxAmount: 15000, interestRate: 10, interestMethod: 'flat',
      tenureDays: 30, apr: 146, processingFee: 0, lateFee: 100, penaltyRatePerDay: 1,
      gracePeriodDays: 0, autoApproveThreshold: 3000, maxDti: 40, coolingOffHours: 48,
      status: 'active', approvedBy: 'U-ADMIN', approvedAt: '2025-12-01T00:00:00Z',
      createdAt: '2025-12-01T00:00:00Z', updatedAt: '2025-12-01T00:00:00Z',
    },
  ];
  
  const loans: Loan[] = [
    {
      id: 'LN-001', tenantId: CURRENT_TENANT, borrowerId: 'BR-001', productId: 'P-001',
      applicationNumber: 'APP-2026-0001', principal: 15000, interestRate: 8,
      interestAmount: 1200, fees: 0, penalties: 0, totalRepayable: 16200,
      amountPaid: 16200, balance: 0, inDuplumCap: 30000, inDuplumReached: false,
      status: 'completed', appliedAt: '2026-01-10T00:00:00Z', kycVerifiedAt: '2026-01-10T00:00:00Z',
      kfsAcceptedAt: '2026-01-11T00:00:00Z', coolingOffEndsAt: '2026-01-12T00:00:00Z',
      approvedAt: '2026-01-12T00:00:00Z', disbursedAt: '2026-01-15T00:00:00Z',
      disbursementRef: 'QKJ8A7B6C5', dueDate: '2026-02-14', daysPastDue: 0,
      completedAt: '2026-02-10T00:00:00Z', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
    },
    {
      id: 'LN-002', tenantId: CURRENT_TENANT, borrowerId: 'BR-002', productId: 'P-002',
      applicationNumber: 'APP-2026-0002', principal: 25000, interestRate: 12,
      interestAmount: 3000, fees: 200, penalties: 0, totalRepayable: 28200,
      amountPaid: 14100, balance: 14100, inDuplumCap: 50000, inDuplumReached: false,
      status: 'active', appliedAt: '2026-01-15T00:00:00Z', kycVerifiedAt: '2026-01-15T00:00:00Z',
      kfsAcceptedAt: '2026-01-16T00:00:00Z', coolingOffEndsAt: '2026-01-17T00:00:00Z',
      approvedAt: '2026-01-17T00:00:00Z', disbursedAt: '2026-01-20T00:00:00Z',
      disbursementRef: 'QKJ9D8E7F6', dueDate: '2026-03-21', daysPastDue: 0,
      createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'LN-003', tenantId: CURRENT_TENANT, borrowerId: 'BR-003', productId: 'P-001',
      applicationNumber: 'APP-2026-0003', principal: 10000, interestRate: 8,
      interestAmount: 800, fees: 0, penalties: 150, totalRepayable: 10950,
      amountPaid: 0, balance: 10950, inDuplumCap: 20000, inDuplumReached: false,
      status: 'overdue', appliedAt: '2025-12-28T00:00:00Z', kycVerifiedAt: '2025-12-28T00:00:00Z',
      kfsAcceptedAt: '2025-12-29T00:00:00Z', coolingOffEndsAt: '2025-12-30T00:00:00Z',
      approvedAt: '2025-12-30T00:00:00Z', disbursedAt: '2026-01-05T00:00:00Z',
      disbursementRef: 'QKJ1A2B3C4', dueDate: '2026-02-04', daysPastDue: 15,
      createdAt: '2025-12-28T00:00:00Z', updatedAt: '2026-02-19T00:00:00Z',
    },
    {
      id: 'LN-004', tenantId: CURRENT_TENANT, borrowerId: 'BR-004', productId: 'P-003',
      applicationNumber: 'APP-2026-0004', principal: 8000, interestRate: 10,
      interestAmount: 800, fees: 0, penalties: 0, totalRepayable: 8800,
      amountPaid: 4400, balance: 4400, inDuplumCap: 16000, inDuplumReached: false,
      status: 'active', appliedAt: '2026-01-20T00:00:00Z', kycVerifiedAt: '2026-01-20T00:00:00Z',
      kfsAcceptedAt: '2026-01-22T00:00:00Z', coolingOffEndsAt: '2026-01-24T00:00:00Z',
      approvedAt: '2026-01-24T00:00:00Z', disbursedAt: '2026-01-25T00:00:00Z',
      disbursementRef: 'QKJ2D3E4F5', dueDate: '2026-02-24', daysPastDue: 0,
      createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'LN-005', tenantId: CURRENT_TENANT, borrowerId: 'BR-005', productId: 'P-002',
      applicationNumber: 'APP-2026-0005', principal: 50000, interestRate: 12,
      interestAmount: 6000, fees: 200, penalties: 750, totalRepayable: 56950,
      amountPaid: 28000, balance: 28950, inDuplumCap: 100000, inDuplumReached: false,
      status: 'overdue', appliedAt: '2025-12-10T00:00:00Z', kycVerifiedAt: '2025-12-10T00:00:00Z',
      kfsAcceptedAt: '2025-12-11T00:00:00Z', coolingOffEndsAt: '2025-12-12T00:00:00Z',
      approvedAt: '2025-12-12T00:00:00Z', disbursedAt: '2025-12-15T00:00:00Z',
      disbursementRef: 'QKJ3G4H5I6', dueDate: '2026-02-13', daysPastDue: 35,
      createdAt: '2025-12-10T00:00:00Z', updatedAt: '2026-02-19T00:00:00Z',
    },
    {
      id: 'LN-006', tenantId: CURRENT_TENANT, borrowerId: 'BR-006', productId: 'P-001',
      applicationNumber: 'APP-2026-0006', principal: 20000, interestRate: 8,
      interestAmount: 1600, fees: 0, penalties: 0, totalRepayable: 21600,
      amountPaid: 0, balance: 21600, inDuplumCap: 40000, inDuplumReached: false,
      status: 'cooling_off', appliedAt: '2026-02-18T00:00:00Z', kycVerifiedAt: '2026-02-18T00:00:00Z',
      kfsAcceptedAt: '2026-02-18T00:00:00Z',
      coolingOffStartsAt: '2026-02-19T12:00:00Z',
      coolingOffEndsAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20h from now
      approvedAt: '2026-02-19T12:00:00Z', dueDate: '2026-03-21', daysPastDue: 0,
      createdAt: '2026-02-18T00:00:00Z', updatedAt: now,
    },
    {
      id: 'LN-007', tenantId: CURRENT_TENANT, borrowerId: 'BR-007', productId: 'P-002',
      applicationNumber: 'APP-2025-0047', principal: 35000, interestRate: 12,
      interestAmount: 4200, fees: 200, penalties: 0, totalRepayable: 39400,
      amountPaid: 70000, balance: 0, inDuplumCap: 70000, inDuplumReached: true,
      status: 'completed', appliedAt: '2025-10-20T00:00:00Z', kycVerifiedAt: '2025-10-20T00:00:00Z',
      kfsAcceptedAt: '2025-10-21T00:00:00Z', coolingOffEndsAt: '2025-10-22T00:00:00Z',
      approvedAt: '2025-10-22T00:00:00Z', disbursedAt: '2025-11-01T00:00:00Z',
      disbursementRef: 'QKJ4J5K6L7', dueDate: '2025-12-01', daysPastDue: 0,
      completedAt: '2025-12-15T00:00:00Z', createdAt: '2025-10-20T00:00:00Z', updatedAt: '2025-12-15T00:00:00Z',
    },
    {
      id: 'LN-008', tenantId: CURRENT_TENANT, borrowerId: 'BR-008', productId: 'P-003',
      applicationNumber: 'APP-2026-0008', principal: 5000, interestRate: 10,
      interestAmount: 500, fees: 0, penalties: 0, totalRepayable: 5500,
      amountPaid: 0, balance: 5500, inDuplumCap: 10000, inDuplumReached: false,
      status: 'disbursed', appliedAt: '2026-02-15T00:00:00Z', kycVerifiedAt: '2026-02-15T00:00:00Z',
      kfsAcceptedAt: '2026-02-16T00:00:00Z', coolingOffEndsAt: '2026-02-18T00:00:00Z',
      approvedAt: '2026-02-18T00:00:00Z', disbursedAt: '2026-02-19T14:32:00Z',
      disbursementRef: 'QKJ5M6N7O8', dueDate: '2026-03-17', daysPastDue: 0,
      createdAt: '2026-02-15T00:00:00Z', updatedAt: now,
    },
  ];
  
  const collectionCases: CollectionCase[] = [
    {
      id: 'CC-001', tenantId: CURRENT_TENANT, loanId: 'LN-003', borrowerId: 'BR-003',
      assignedTo: 'U-JANE', bucket: '1-30', status: 'active', daysPastDue: 15,
      amountDue: 10950, contactsToday: 1, lastContactAt: '2026-02-17T10:00:00Z',
      complaintsCount: 0, createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-02-17T10:00:00Z',
    },
    {
      id: 'CC-002', tenantId: CURRENT_TENANT, loanId: 'LN-005', borrowerId: 'BR-005',
      assignedTo: 'U-JANE', bucket: '31-60', status: 'ptp', daysPastDue: 35,
      amountDue: 28950, contactsToday: 0, lastContactAt: '2026-02-18T14:00:00Z',
      promiseToPay: { date: '2026-02-25', amount: 14000, status: 'pending', loggedAt: '2026-02-18T14:30:00Z' },
      complaintsCount: 0, createdAt: '2026-02-14T00:00:00Z', updatedAt: '2026-02-18T14:30:00Z',
    },
    {
      id: 'CC-003', tenantId: CURRENT_TENANT, loanId: 'LN-009', borrowerId: 'BR-003',
      assignedTo: 'U-MARK', bucket: '31-60', status: 'active', daysPastDue: 45,
      amountDue: 6480, contactsToday: 2, lastContactAt: '2026-02-19T11:00:00Z',
      complaintsCount: 0, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-19T11:00:00Z',
    },
    {
      id: 'CC-004', tenantId: CURRENT_TENANT, loanId: 'LN-011', borrowerId: 'BR-005',
      assignedTo: 'U-MARK', bucket: '61-90', status: 'escalated', daysPastDue: 75,
      amountDue: 45000, contactsToday: 0, lastContactAt: '2026-02-15T00:00:00Z',
      complaintsCount: 1, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'CC-005', tenantId: CURRENT_TENANT, loanId: 'LN-012', borrowerId: 'BR-007',
      assignedTo: 'U-ADMIN', bucket: '90+', status: 'escalated', daysPastDue: 120,
      amountDue: 18000, contactsToday: 0, lastContactAt: '2026-02-10T00:00:00Z',
      complaintsCount: 0, createdAt: '2025-12-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
    },
  ];
  
  const alerts: ComplianceAlert[] = [
    {
      id: 'CA-001', tenantId: CURRENT_TENANT, type: 'in_duplum', severity: 'high',
      title: 'In Duplum Limit Reached',
      description: 'Loan LN-007 has reached the 2× principal cap (KES 70,000). All further interest/fees/penalties auto-waived.',
      entityType: 'Loan', entityId: 'LN-007', resolved: false, createdAt: '2025-12-15T00:00:00Z',
    },
    {
      id: 'CA-002', tenantId: CURRENT_TENANT, type: 'contact_limit', severity: 'medium',
      title: 'Contact Frequency Warning',
      description: 'Case CC-003 approaching daily contact limit (2/3). Next contact will trigger suppression.',
      entityType: 'CollectionCase', entityId: 'CC-003', resolved: false, createdAt: '2026-02-19T12:00:00Z',
    },
    {
      id: 'CA-003', tenantId: CURRENT_TENANT, type: 'cooling_off', severity: 'info',
      title: 'Cooling-Off Period Active',
      description: 'Loan LN-006 in 24-hour cooling-off period. Disbursement blocked until period expires.',
      entityType: 'Loan', entityId: 'LN-006', resolved: false, createdAt: '2026-02-19T12:00:00Z',
    },
    {
      id: 'CA-004', tenantId: CURRENT_TENANT, type: 'consent_withdrawn', severity: 'medium',
      title: 'Marketing Consent Withdrawn',
      description: 'Borrower BR-004 (Grace Akinyi) withdrew marketing consent. All marketing communications ceased.',
      entityType: 'Borrower', entityId: 'BR-004', resolved: true, resolvedAt: '2026-02-18T00:00:00Z',
      createdAt: '2026-02-17T00:00:00Z',
    },
    {
      id: 'CA-005', tenantId: CURRENT_TENANT, type: 'par_threshold', severity: 'critical',
      title: 'PAR 30 Exceeds Threshold',
      description: 'Portfolio-at-Risk (30 days) is 8.2%, exceeding the 7% internal threshold. Review required.',
      resolved: false, createdAt: '2026-02-19T08:00:00Z',
    },
  ];
  
  const complaints: Complaint[] = [
    {
      id: 'CMP-001', tenantId: CURRENT_TENANT, borrowerId: 'BR-005', loanId: 'LN-005',
      category: 'charges', description: 'Borrower disputes penalty charges applied during illness.',
      status: 'investigating', assignedTo: 'U-SARAH',
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: '2026-02-18T00:00:00Z',
    },
  ];
  
  // Genesis audit entry
  const genesisAudit: any = {
    id: 'AU-GENESIS',
    tenantId: CURRENT_TENANT,
    timestamp: now,
    userId: 'system',
    userName: 'System',
    action: 'DATABASE_INITIALIZED',
    entityType: 'System',
    entityId: 'GENESIS',
    details: 'Database initialized with seed data. Hash chain started.',
    ipAddress: 'system',
    previousHash: '0'.repeat(64),
    hash: genesisHash,
    retentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  return {
    tenants: [tenant],
    users,
    borrowers,
    consents,
    products,
    loans,
    schedules: [],
    mpesaTransactions: [],
    collectionCases,
    collectionContacts: [],
    auditLog: [genesisAudit],
    alerts,
    complaints,
    webhooks: [],
    _meta: {
      version: '1.0.0',
      lastBackup: now,
      tenantId: CURRENT_TENANT,
    },
  };
}
