export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  tier: 'free' | 'starter' | 'growth' | 'enterprise';
  activeLoans: number;
  maxLoans: number;
  logo?: string;
  primaryColor: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerPhone: string;
  productId: string;
  productName: string;
  principal: number;
  interestRate: number;
  totalRepayable: number;
  amountPaid: number;
  balance: number;
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'overdue' | 'completed' | 'defaulted' | 'restructured';
  disbursedAt?: string;
  dueDate: string;
  daysPastDue: number;
  inDuplumReached: boolean;
  coolingOffEndsAt?: string;
  kfsAccepted: boolean;
  consentGiven: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  interestMethod: 'flat' | 'reducing';
  tenureDays: number;
  apr: number;
  status: 'draft' | 'active' | 'paused';
  autoApproveThreshold: number;
  applications: number;
  approvalRate: number;
}

export interface CollectionCase {
  id: string;
  loanId: string;
  borrowerName: string;
  borrowerPhone: string;
  amountDue: number;
  daysPastDue: number;
  bucket: '1-30' | '31-60' | '61-90' | '90+';
  lastContactDate?: string;
  contactsToday: number;
  maxContactsPerDay: number;
  promiseToPay?: {
    date: string;
    amount: number;
    status: 'pending' | 'kept' | 'broken';
  };
  assignedTo: string;
  status: 'active' | 'ptp' | 'restructured' | 'escalated' | 'resolved';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  hash: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'conduct_violation' | 'in_duplum' | 'consent_expired' | 'cooling_off' | 'complaint_threshold' | 'overdue_report';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  tenantId: string;
  createdAt: string;
  resolved: boolean;
}

export interface Integration {
  id: string;
  name: string;
  category: 'payment' | 'sms' | 'kyc' | 'crb' | 'email';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  details: string;
}

export interface DashboardStats {
  totalDisbursed: number;
  totalCollected: number;
  activeLoans: number;
  portfolioAtRisk30: number;
  portfolioAtRisk60: number;
  portfolioAtRisk90: number;
  approvalRate: number;
  avgProcessingTime: string;
  newApplications: number;
  collectionsRecovered: number;
}
