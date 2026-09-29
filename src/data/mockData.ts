import { Loan, Product, CollectionCase, AuditEntry, ComplianceAlert, Integration, DashboardStats } from '../types';

export const dashboardStats: DashboardStats = {
  totalDisbursed: 45_800_000,
  totalCollected: 32_450_000,
  activeLoans: 1_247,
  portfolioAtRisk30: 8.2,
  portfolioAtRisk60: 4.1,
  portfolioAtRisk90: 1.8,
  approvalRate: 67.3,
  avgProcessingTime: '4m 32s',
  newApplications: 89,
  collectionsRecovered: 2_340_000,
};

export const loans: Loan[] = [
  { id: 'LN-001', borrowerName: 'James Mwangi', borrowerPhone: '+254712345678', productId: 'P-001', productName: 'Salary Advance', principal: 15000, interestRate: 8, totalRepayable: 16200, amountPaid: 16200, balance: 0, status: 'completed', disbursedAt: '2026-01-15', dueDate: '2026-02-14', daysPastDue: 0, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-002', borrowerName: 'Mary Wanjiku', borrowerPhone: '+254723456789', productId: 'P-002', productName: 'Micro Personal', principal: 25000, interestRate: 12, totalRepayable: 28000, amountPaid: 14000, balance: 14000, status: 'active', disbursedAt: '2026-01-20', dueDate: '2026-02-19', daysPastDue: 0, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-003', borrowerName: 'Peter Ochieng', borrowerPhone: '+254734567890', productId: 'P-001', productName: 'Salary Advance', principal: 10000, interestRate: 8, totalRepayable: 10800, amountPaid: 0, balance: 10800, status: 'overdue', disbursedAt: '2026-01-05', dueDate: '2026-02-04', daysPastDue: 15, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-004', borrowerName: 'Grace Akinyi', borrowerPhone: '+254745678901', productId: 'P-003', productName: 'First-Time Borrower', principal: 8000, interestRate: 10, totalRepayable: 8800, amountPaid: 4400, balance: 4400, status: 'active', disbursedAt: '2026-01-25', dueDate: '2026-02-24', daysPastDue: 0, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-005', borrowerName: 'David Kamau', borrowerPhone: '+254756789012', productId: 'P-002', productName: 'Micro Personal', principal: 50000, interestRate: 12, totalRepayable: 56000, amountPaid: 28000, balance: 28000, status: 'overdue', disbursedAt: '2025-12-15', dueDate: '2026-01-14', daysPastDue: 35, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-006', borrowerName: 'Faith Njeri', borrowerPhone: '+254767890123', productId: 'P-001', productName: 'Salary Advance', principal: 20000, interestRate: 8, totalRepayable: 21600, amountPaid: 0, balance: 21600, status: 'pending', dueDate: '2026-03-01', daysPastDue: 0, inDuplumReached: false, kfsAccepted: true, consentGiven: true, coolingOffEndsAt: '2026-02-20T14:00:00Z' },
  { id: 'LN-007', borrowerName: 'Samuel Kipchoge', borrowerPhone: '+254778901234', productId: 'P-002', productName: 'Micro Personal', principal: 35000, interestRate: 12, totalRepayable: 70000, amountPaid: 70000, balance: 0, status: 'completed', disbursedAt: '2025-11-01', dueDate: '2025-12-01', daysPastDue: 0, inDuplumReached: true, kfsAccepted: true, consentGiven: true },
  { id: 'LN-008', borrowerName: 'Lucy Muthoni', borrowerPhone: '+254789012345', productId: 'P-003', productName: 'First-Time Borrower', principal: 5000, interestRate: 10, totalRepayable: 5500, amountPaid: 0, balance: 5500, status: 'disbursed', disbursedAt: '2026-02-18', dueDate: '2026-03-20', daysPastDue: 0, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-009', borrowerName: 'John Mutua', borrowerPhone: '+254790123456', productId: 'P-001', productName: 'Salary Advance', principal: 12000, interestRate: 8, totalRepayable: 12960, amountPaid: 6480, balance: 6480, status: 'overdue', disbursedAt: '2025-12-20', dueDate: '2026-01-19', daysPastDue: 45, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
  { id: 'LN-010', borrowerName: 'Agnes Wambui', borrowerPhone: '+254701234567', productId: 'P-002', productName: 'Micro Personal', principal: 30000, interestRate: 12, totalRepayable: 33600, amountPaid: 16800, balance: 16800, status: 'active', disbursedAt: '2026-01-28', dueDate: '2026-02-27', daysPastDue: 0, inDuplumReached: false, kfsAccepted: true, consentGiven: true },
];

export const products: Product[] = [
  { id: 'P-001', name: 'Salary Advance', description: 'Short-term salary advance for employed borrowers with verified income', minAmount: 5000, maxAmount: 25000, interestRate: 8, interestMethod: 'flat', tenureDays: 30, apr: 115.2, status: 'active', autoApproveThreshold: 5000, applications: 342, approvalRate: 72.5 },
  { id: 'P-002', name: 'Micro Personal', description: 'Flexible personal loans for broader retail segment', minAmount: 5000, maxAmount: 50000, interestRate: 12, interestMethod: 'reducing', tenureDays: 60, apr: 175.2, status: 'active', autoApproveThreshold: 5000, applications: 567, approvalRate: 64.8 },
  { id: 'P-003', name: 'First-Time Borrower', description: 'Controlled lending for thin-file borrowers with alternative data', minAmount: 2000, maxAmount: 15000, interestRate: 10, interestMethod: 'flat', tenureDays: 30, apr: 146, status: 'active', autoApproveThreshold: 3000, applications: 189, approvalRate: 58.2 },
  { id: 'P-004', name: 'Emergency Cash', description: 'Quick disbursement for emergency needs (draft)', minAmount: 1000, maxAmount: 10000, interestRate: 15, interestMethod: 'flat', tenureDays: 14, apr: 219, status: 'draft', autoApproveThreshold: 2000, applications: 0, approvalRate: 0 },
];

export const collectionCases: CollectionCase[] = [
  { id: 'CC-001', loanId: 'LN-003', borrowerName: 'Peter Ochieng', borrowerPhone: '+254734567890', amountDue: 10800, daysPastDue: 15, bucket: '1-30', lastContactDate: '2026-02-17', contactsToday: 1, maxContactsPerDay: 3, assignedTo: 'Jane Collections', status: 'active' },
  { id: 'CC-002', loanId: 'LN-005', borrowerName: 'David Kamau', borrowerPhone: '+254756789012', amountDue: 28000, daysPastDue: 35, bucket: '31-60', lastContactDate: '2026-02-18', contactsToday: 0, maxContactsPerDay: 3, promiseToPay: { date: '2026-02-25', amount: 14000, status: 'pending' }, assignedTo: 'Jane Collections', status: 'ptp' },
  { id: 'CC-003', loanId: 'LN-009', borrowerName: 'John Mutua', borrowerPhone: '+254790123456', amountDue: 6480, daysPastDue: 45, bucket: '31-60', lastContactDate: '2026-02-16', contactsToday: 2, maxContactsPerDay: 3, assignedTo: 'Mark Otieno', status: 'active' },
  { id: 'CC-004', loanId: 'LN-011', borrowerName: 'Hassan Abdi', borrowerPhone: '+254711223344', amountDue: 45000, daysPastDue: 75, bucket: '61-90', lastContactDate: '2026-02-15', contactsToday: 0, maxContactsPerDay: 3, assignedTo: 'Mark Otieno', status: 'escalated' },
  { id: 'CC-005', loanId: 'LN-012', borrowerName: 'Catherine Naliaka', borrowerPhone: '+254722334455', amountDue: 18000, daysPastDue: 120, bucket: '90+', lastContactDate: '2026-02-10', contactsToday: 0, maxContactsPerDay: 3, assignedTo: 'Supervisor', status: 'escalated' },
  { id: 'CC-006', loanId: 'LN-013', borrowerName: 'Robert Kariuki', borrowerPhone: '+254733445566', amountDue: 8500, daysPastDue: 5, bucket: '1-30', contactsToday: 0, maxContactsPerDay: 3, assignedTo: 'Jane Collections', status: 'active' },
];

export const auditEntries: AuditEntry[] = [
  { id: 'AU-001', timestamp: '2026-02-19T14:32:00Z', user: 'admin@mikalenders.co.ke', action: 'LOAN_DISBURSED', entity: 'Loan', entityId: 'LN-008', details: 'Disbursed KES 5,000 via M-Pesa B2C to +254789012345', ipAddress: '41.80.123.45', hash: 'a3f8c2...' },
  { id: 'AU-002', timestamp: '2026-02-19T14:28:00Z', user: 'system', action: 'IN_DUPLUM_CHECK', entity: 'Loan', entityId: 'LN-007', details: 'In duplum limit reached. Total recoverable capped at KES 70,000 (2× principal). Further charges blocked.', ipAddress: 'system', hash: 'b7e1d4...' },
  { id: 'AU-003', timestamp: '2026-02-19T14:15:00Z', user: 'jane@mikalenders.co.ke', action: 'PTP_LOGGED', entity: 'CollectionCase', entityId: 'CC-002', details: 'Promise-to-pay logged: KES 14,000 by 2026-02-25. Cooling-off activated.', ipAddress: '41.80.123.46', hash: 'c9a2f5...' },
  { id: 'AU-004', timestamp: '2026-02-19T13:50:00Z', user: 'system', action: 'CONSENT_WITHDRAWN', entity: 'Borrower', entityId: 'BR-045', details: 'Marketing consent withdrawn. All marketing communications ceased.', ipAddress: '105.163.45.67', hash: 'd4b8e1...' },
  { id: 'AU-005', timestamp: '2026-02-19T13:30:00Z', user: 'admin@mikalenders.co.ke', action: 'PRODUCT_UPDATED', entity: 'Product', entityId: 'P-002', details: 'Interest rate changed from 14% to 12%. Requires dual approval.', ipAddress: '41.80.123.45', hash: 'e6c3a7...' },
  { id: 'AU-006', timestamp: '2026-02-19T12:45:00Z', user: 'system', action: 'COOLING_OFF_STARTED', entity: 'Loan', entityId: 'LN-006', details: '24-hour cooling-off period started. Disbursement blocked until 2026-02-20T14:00:00Z.', ipAddress: 'system', hash: 'f2d9b4...' },
  { id: 'AU-007', timestamp: '2026-02-19T12:00:00Z', user: 'system', action: 'CONDUCT_BLOCK', entity: 'Collections', entityId: 'CC-003', details: 'Contact limit reached (2/3). Further automated contacts suppressed until next day.', ipAddress: 'system', hash: 'a8e5c1...' },
  { id: 'AU-008', timestamp: '2026-02-19T11:30:00Z', user: 'mark@mikalenders.co.ke', action: 'LOAN_APPROVED', entity: 'Loan', entityId: 'LN-010', details: 'Manual approval after scorecard review. Score: 72/100. DTI: 35%.', ipAddress: '41.80.123.47', hash: 'b1f7d3...' },
];

export const complianceAlerts: ComplianceAlert[] = [
  { id: 'CA-001', type: 'in_duplum', severity: 'high', title: 'In Duplum Limit Reached', description: 'Loan LN-007 has reached the 2× principal cap. All further interest/fees/penalties auto-waived.', tenantId: 'T-001', createdAt: '2026-02-19T14:28:00Z', resolved: false },
  { id: 'CA-002', type: 'conduct_violation', severity: 'medium', title: 'Contact Frequency Warning', description: 'Case CC-003 approaching daily contact limit (2/3). Next contact will trigger suppression.', tenantId: 'T-001', createdAt: '2026-02-19T12:00:00Z', resolved: false },
  { id: 'CA-003', type: 'cooling_off', severity: 'low', title: 'Cooling-Off Period Active', description: 'Loan LN-006 in 24-hour cooling-off period. Disbursement blocked.', tenantId: 'T-001', createdAt: '2026-02-19T12:45:00Z', resolved: false },
  { id: 'CA-004', type: 'consent_expired', severity: 'medium', title: 'Consent Withdrawn', description: 'Borrower BR-045 withdrew marketing consent. All marketing communications ceased.', tenantId: 'T-001', createdAt: '2026-02-19T13:50:00Z', resolved: true },
  { id: 'CA-005', type: 'overdue_report', severity: 'critical', title: 'PAR 30 Exceeds Threshold', description: 'Portfolio-at-Risk (30 days) is 8.2%, exceeding the 7% threshold. Review required.', tenantId: 'T-001', createdAt: '2026-02-19T08:00:00Z', resolved: false },
];

export const integrations: Integration[] = [
  { id: 'INT-001', name: 'M-Pesa Daraja API', category: 'payment', status: 'connected', lastSync: '2026-02-19T14:30:00Z', details: 'C2B + B2C + STK Push active. Paybill: 247247' },
  { id: 'INT-002', name: "Africa's Talking SMS", category: 'sms', status: 'connected', lastSync: '2026-02-19T14:29:00Z', details: 'SMS gateway active. Avg delivery: 3.2s. 12,450 messages this month.' },
  { id: 'INT-003', name: 'AWS SES Email', category: 'email', status: 'connected', lastSync: '2026-02-19T14:25:00Z', details: 'Email service active. 3,200 emails sent this month. Bounce rate: 0.3%.' },
  { id: 'INT-004', name: 'Smile Identity KYC', category: 'kyc', status: 'connected', lastSync: '2026-02-19T13:00:00Z', details: 'ID verification active. 89 verifications this month. Pass rate: 94%.' },
  { id: 'INT-005', name: 'Metropol CRB', category: 'crb', status: 'connected', lastSync: '2026-02-19T14:00:00Z', details: 'Credit reports active. 156 pulls this month. Avg response: 1.2s.' },
  { id: 'INT-006', name: 'TransUnion CRB', category: 'crb', status: 'disconnected', details: 'Backup CRB provider. Not configured for production.' },
];

export const disbursementData = [
  { month: 'Sep', disbursed: 28_500_000, collected: 22_100_000 },
  { month: 'Oct', disbursed: 32_000_000, collected: 25_800_000 },
  { month: 'Nov', disbursed: 35_200_000, collected: 28_400_000 },
  { month: 'Dec', disbursed: 38_700_000, collected: 30_200_000 },
  { month: 'Jan', disbursed: 42_100_000, collected: 33_500_000 },
  { month: 'Feb', disbursed: 45_800_000, collected: 32_450_000 },
];

export const parData = [
  { month: 'Sep', par30: 6.1, par60: 3.2, par90: 1.5 },
  { month: 'Oct', par30: 5.8, par60: 3.0, par90: 1.4 },
  { month: 'Nov', par30: 7.2, par60: 3.8, par90: 1.6 },
  { month: 'Dec', par30: 6.9, par60: 3.5, par90: 1.5 },
  { month: 'Jan', par30: 7.8, par60: 4.0, par90: 1.7 },
  { month: 'Feb', par30: 8.2, par60: 4.1, par90: 1.8 },
];

export const applicationFunnel = [
  { stage: 'Applications', count: 892 },
  { stage: 'KYC Complete', count: 756 },
  { stage: 'Scorecard Run', count: 734 },
  { stage: 'Approved', count: 601 },
  { stage: 'KFS Accepted', count: 589 },
  { stage: 'Cooling-Off Passed', count: 578 },
  { stage: 'Disbursed', count: 567 },
];
