// ============================================================================
// LendingOS Data Schema — Mirrors Prisma schema.prisma
// Multi-tenant with row-level security simulation
// ============================================================================

export type Tier = 'free' | 'starter' | 'growth' | 'enterprise';
export type LoanStatus = 'applied' | 'kyc_pending' | 'kyc_verified' | 'kfs_pending' | 'kfs_accepted' | 'cooling_off' | 'decision_pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'overdue' | 'restructured' | 'completed' | 'defaulted' | 'written_off';
export type InterestMethod = 'flat' | 'reducing';
export type ProductStatus = 'draft' | 'active' | 'paused' | 'archived';
export type CollectionBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';
export type ContactChannel = 'sms' | 'call' | 'push' | 'email';
export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'conduct_violation' | 'in_duplum' | 'consent_withdrawn' | 'cooling_off' | 'complaint_threshold' | 'par_threshold' | 'ptp_broken' | 'contact_limit' | 'after_hours';
export type ConsentType = 'credit_check' | 'crb_reporting' | 'marketing' | 'data_processing' | 'contact_access';
export type MpesaTransactionType = 'C2B' | 'B2C' | 'STK_PUSH';
export type MpesaTransactionStatus = 'pending' | 'completed' | 'failed' | 'timeout';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  tier: Tier;
  activeLoans: number;
  maxLoans: number;
  primaryColor: string;
  logo?: string;
  paybillNumber?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'admin' | 'credit_officer' | 'loan_admin' | 'collections' | 'compliance';
  mfaEnabled: boolean;
  status: 'active' | 'disabled';
  lastLogin?: string;
  createdAt: string;
}

export interface Borrower {
  id: string;
  tenantId: string;
  phone: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycVerifiedAt?: string;
  creditScore?: number;
  monthlyIncome?: number;
  employmentStatus?: string;
  vulnerableConsumer?: boolean;
  createdAt: string;
}

export interface BorrowerConsent {
  id: string;
  borrowerId: string;
  tenantId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedAt?: string;
  withdrawnAt?: string;
  ipAddress?: string;
  userAgent?: string;
  consentVersion: string;
}

export interface LoanProduct {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number; // percentage
  interestMethod: InterestMethod;
  tenureDays: number;
  apr: number;
  processingFee?: number;
  lateFee?: number;
  penaltyRatePerDay?: number;
  gracePeriodDays: number;
  autoApproveThreshold: number;
  maxDti: number; // debt-to-income max %
  coolingOffHours: number;
  status: ProductStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  tenantId: string;
  borrowerId: string;
  productId: string;
  applicationNumber: string;
  principal: number;
  interestRate: number;
  interestAmount: number;
  fees: number;
  penalties: number;
  totalRepayable: number;
  amountPaid: number;
  balance: number;
  inDuplumCap: number; // 2x principal — HARD CAP
  inDuplumReached: boolean;
  status: LoanStatus;
  appliedAt: string;
  kycVerifiedAt?: string;
  kfsAcceptedAt?: string;
  coolingOffStartsAt?: string;
  coolingOffEndsAt?: string;
  decisionAt?: string;
  decisionBy?: string;
  decisionReason?: string;
  approvedAt?: string;
  disbursedAt?: string;
  disbursementRef?: string; // M-Pesa transaction ref
  dueDate: string;
  daysPastDue: number;
  completedAt?: string;
  restructuredFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentSchedule {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  feesDue: number;
  totalDue: number;
  paidAmount: number;
  paidAt?: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
}

export interface MpesaTransaction {
  id: string;
  tenantId: string;
  loanId?: string;
  borrowerId?: string;
  type: MpesaTransactionType;
  amount: number;
  phone: string;
  reference: string; // Account reference (loan ID)
  mpesaReceipt?: string; // Safaricom receipt
  status: MpesaTransactionStatus;
  requestAt: string;
  completedAt?: string;
  failureReason?: string;
  retryCount: number;
}

export interface CollectionCase {
  id: string;
  tenantId: string;
  loanId: string;
  borrowerId: string;
  assignedTo?: string;
  bucket: CollectionBucket;
  status: 'new' | 'active' | 'ptp' | 'restructured' | 'escalated' | 'resolved';
  daysPastDue: number;
  amountDue: number;
  contactsToday: number;
  lastContactAt?: string;
  promiseToPay?: {
    date: string;
    amount: number;
    status: 'pending' | 'kept' | 'broken';
    loggedAt: string;
  };
  complaintsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionContact {
  id: string;
  caseId: string;
  loanId: string;
  borrowerId: string;
  channel: ContactChannel;
  templateId: string;
  content: string; // Pre-approved template only — NO free text
  sentAt: string;
  deliveredAt?: string;
  outcome?: string;
  agentId: string;
  contentHash: string; // Tamper-evident
}

export interface AuditEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  details: string;
  ipAddress: string;
  userAgent?: string;
  previousHash: string;
  hash: string; // SHA-256 of this entry + previousHash
  retentionUntil: string; // 7 years from timestamp
}

export interface ComplianceAlert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityType?: string;
  entityId?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  tenantId: string;
  borrowerId: string;
  loanId?: string;
  category: 'conduct' | 'charges' | 'service' | 'data' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
  resolution?: string;
  slaDeadline: string; // 48 hours from creation
  createdAt: string;
  resolvedAt?: string;
}

// Database state shape
export interface Database {
  tenants: Tenant[];
  users: User[];
  borrowers: Borrower[];
  consents: BorrowerConsent[];
  products: LoanProduct[];
  loans: Loan[];
  schedules: RepaymentSchedule[];
  mpesaTransactions: MpesaTransaction[];
  collectionCases: CollectionCase[];
  collectionContacts: CollectionContact[];
  auditLog: AuditEntry[];
  alerts: ComplianceAlert[];
  complaints: Complaint[];
  _meta: {
    version: string;
    lastBackup: string;
    tenantId: string; // Current active tenant (simulates row-level security)
  };
}
