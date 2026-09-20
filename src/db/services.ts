// ============================================================================
// LendingOS Services — Compliance business logic
// Mirrors backend/src/services/*.js
// ============================================================================
import type { AuditEntry, Loan, LoanProduct, BorrowerConsent, ConsentType, CollectionCase, CollectionContact, ContactChannel, MpesaTransaction, ComplianceAlert } from './schema';

const STORAGE_KEY = 'lendingos_db_v1';
const CURRENT_TENANT = 'T-MIKA-001';

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
export function loadDB(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDB(db: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------
export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Hashing — SHA-256 for tamper-evident audit log
// ---------------------------------------------------------------------------
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// AUDIT SERVICE — Tamper-evident, hash-chained, 7-year retention (CA-001)
// ---------------------------------------------------------------------------
export async function writeAuditLog(
  db: any,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  user: { id: string; name: string },
  before?: any,
  after?: any
): Promise<AuditEntry> {
  const timestamp = new Date().toISOString();
  const previous = db.auditLog[db.auditLog.length - 1];
  const previousHash = previous?.hash || '0'.repeat(64);
  
  const payload = JSON.stringify({
    timestamp,
    userId: user.id,
    action,
    entityType,
    entityId,
    details,
    previousHash,
    before: before ? JSON.stringify(before) : null,
    after: after ? JSON.stringify(after) : null,
  });
  
  const hash = await sha256(payload);
  
  const entry: AuditEntry = {
    id: genId('AU'),
    tenantId: CURRENT_TENANT,
    timestamp,
    userId: user.id,
    userName: user.name,
    action,
    entityType,
    entityId,
    before,
    after,
    details,
    ipAddress: '41.80.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
    previousHash,
    hash,
    retentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  db.auditLog.push(entry);
  return entry;
}

// ---------------------------------------------------------------------------
// IN DUPLUM SERVICE — Hard cap at 2× principal (LS-005)
// ---------------------------------------------------------------------------
export function checkInDuplum(loan: Loan): { blocked: boolean; cap: number; current: number } {
  const cap = loan.inDuplumCap; // 2× principal
  const current = loan.interestAmount + loan.fees + loan.penalties + loan.amountPaid;
  return {
    blocked: current >= cap,
    cap,
    current,
  };
}

export function enforceInDuplum(loan: Loan): Loan {
  const { blocked, cap } = checkInDuplum(loan);
  if (blocked && !loan.inDuplumReached) {
    return { ...loan, inDuplumReached: true, penalties: 0 };
  }
  if (blocked) {
    // Strip any new penalties/fees
    return { ...loan, penalties: 0 };
  }
  return loan;
}

// ---------------------------------------------------------------------------
// KFS SERVICE — Key Facts Statement auto-generation (KFS-001)
// ---------------------------------------------------------------------------
export function generateKFS(loan: Loan, product: LoanProduct, borrowerName: string) {
  return {
    loanId: loan.id,
    applicationNumber: loan.applicationNumber,
    borrowerName,
    productName: product.name,
    principal: loan.principal,
    interestRate: loan.interestRate,
    interestMethod: product.interestMethod,
    apr: product.apr,
    tenureDays: product.tenureDays,
    processingFee: loan.fees,
    totalInterest: loan.interestAmount,
    totalRepayable: loan.totalRepayable,
    repaymentSchedule: `Lump sum due ${loan.dueDate}`,
    latePaymentPenalty: `${product.penaltyRatePerDay || 0}% per day`,
    inDuplumNotice: `Maximum payable capped at KES ${loan.inDuplumCap.toLocaleString()} (in duplum rule)`,
    generatedAt: new Date().toISOString(),
    version: '2.1',
  };
}

// ---------------------------------------------------------------------------
// COOLING-OFF SERVICE — Reflection period (COP-001)
// ---------------------------------------------------------------------------
export function startCoolingOff(loan: Loan, hours: number): Loan {
  const start = new Date();
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return {
    ...loan,
    status: 'cooling_off',
    coolingOffStartsAt: start.toISOString(),
    coolingOffEndsAt: end.toISOString(),
  };
}

export function canDisburse(loan: Loan): { allowed: boolean; reason?: string } {
  if (loan.status !== 'approved' && loan.status !== 'cooling_off') {
    return { allowed: false, reason: 'Loan not in approved/cooling-off state' };
  }
  if (loan.coolingOffEndsAt && new Date(loan.coolingOffEndsAt) > new Date()) {
    const remaining = Math.ceil((new Date(loan.coolingOffEndsAt).getTime() - Date.now()) / (1000 * 60 * 60));
    return { allowed: false, reason: `Cooling-off period active — ${remaining}h remaining` };
  }
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// CONSENT SERVICE — Granular, withdrawable consent (CON-001)
// ---------------------------------------------------------------------------
export function grantConsent(
  db: any,
  borrowerId: string,
  consentType: ConsentType,
  version: string = '2.1'
) {
  const existing = db.consents.find(
    (c: BorrowerConsent) => c.borrowerId === borrowerId && c.consentType === consentType && c.granted
  );
  if (existing) return existing;
  
  const consent: BorrowerConsent = {
    id: genId('CON'),
    borrowerId,
    tenantId: CURRENT_TENANT,
    consentType,
    granted: true,
    grantedAt: new Date().toISOString(),
    ipAddress: '105.163.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
    consentVersion: version,
  };
  db.consents.push(consent);
  return consent;
}

export function withdrawConsent(db: any, borrowerId: string, consentType: ConsentType) {
  const consent = db.consents.find(
    (c: BorrowerConsent) => c.borrowerId === borrowerId && c.consentType === consentType && c.granted
  );
  if (!consent) return null;
  consent.granted = false;
  consent.withdrawnAt = new Date().toISOString();
  return consent;
}

export function hasConsent(db: any, borrowerId: string, consentType: ConsentType): boolean {
  return db.consents.some(
    (c: BorrowerConsent) => c.borrowerId === borrowerId && c.consentType === consentType && c.granted
  );
}

// ---------------------------------------------------------------------------
// COLLECTIONS CONDUCT SERVICE — Hard-blocks (CL-005 to CL-010)
// ---------------------------------------------------------------------------
export function canContactBorrower(
  db: any,
  caseId: string,
  channel: ContactChannel
): { allowed: boolean; reason?: string } {
  const collectionCase = db.collectionCases.find((c: CollectionCase) => c.id === caseId);
  if (!collectionCase) return { allowed: false, reason: 'Case not found' };
  
  // CL-009: Max 3 contacts per borrower per day
  if (collectionCase.contactsToday >= 3) {
    return { allowed: false, reason: 'Daily contact limit reached (3/3). Suppressed until tomorrow.' };
  }
  
  // Permitted hours: 07:00 - 20:00
  const now = new Date();
  const hour = now.getHours();
  if (hour < 7 || hour >= 20) {
    return { allowed: false, reason: 'Outside permitted hours (07:00 - 20:00)' };
  }
  
  // No contact on Sundays
  if (now.getDay() === 0) {
    return { allowed: false, reason: 'No contact permitted on Sundays' };
  }
  
  // After PTP: suppress until PTP date (48-hour cooling-off)
  if (collectionCase.promiseToPay?.status === 'pending') {
    const ptpDate = new Date(collectionCase.promiseToPay.date);
    const coolingOffEnd = new Date(ptpDate.getTime() - 48 * 60 * 60 * 1000);
    if (now < coolingOffEnd) {
      return { allowed: false, reason: 'Promise-to-Pay cooling-off active' };
    }
  }
  
  // Open complaint: suppress until resolved
  const openComplaint = db.complaints.some(
    (c: any) => c.borrowerId === collectionCase.borrowerId && c.status === 'open'
  );
  if (openComplaint) {
    return { allowed: false, reason: 'Open complaint — collections suppressed until resolved' };
  }
  
  return { allowed: true };
}

export function logCollectionContact(
  db: any,
  caseId: string,
  channel: ContactChannel,
  templateId: string,
  content: string,
  agentId: string
): Promise<CollectionContact> {
  const collectionCase = db.collectionCases.find((c: CollectionCase) => c.id === caseId);
  if (!collectionCase) throw new Error('Case not found');
  
  return sha256(content + Date.now()).then(contentHash => {
    const contact: CollectionContact = {
      id: genId('CC'),
      caseId,
      loanId: collectionCase.loanId,
      borrowerId: collectionCase.borrowerId,
      channel,
      templateId,
      content,
      sentAt: new Date().toISOString(),
      agentId,
      contentHash,
    };
    db.collectionContacts.push(contact);
    collectionCase.contactsToday += 1;
    collectionCase.lastContactAt = contact.sentAt;
    return contact;
  });
}

// ---------------------------------------------------------------------------
// M-PESA SERVICE — Daraja API simulation
// ---------------------------------------------------------------------------
export function simulateMpesaB2C(db: any, loan: Loan, phone: string): MpesaTransaction {
  const txn: MpesaTransaction = {
    id: genId('MP'),
    tenantId: CURRENT_TENANT,
    loanId: loan.id,
    borrowerId: loan.borrowerId,
    type: 'B2C',
    amount: loan.principal,
    phone,
    reference: loan.id,
    status: 'pending',
    requestAt: new Date().toISOString(),
    retryCount: 0,
  };
  db.mpesaTransactions.push(txn);
  
  // Simulate async completion (98% success rate)
  setTimeout(() => {
    const stored = db.mpesaTransactions.find((t: MpesaTransaction) => t.id === txn.id);
    if (!stored) return;
    const freshDb = loadDB();
    if (!freshDb) return;
    const target = freshDb.mpesaTransactions.find((t: MpesaTransaction) => t.id === txn.id);
    if (!target) return;
    
    if (Math.random() < 0.98) {
      target.status = 'completed';
      target.mpesaReceipt = 'QKJ' + Math.random().toString(36).slice(2, 10).toUpperCase();
      target.completedAt = new Date().toISOString();
      // Update loan
      const loanTarget = freshDb.loans.find((l: Loan) => l.id === loan.id);
      if (loanTarget) {
        loanTarget.status = 'active';
        loanTarget.disbursedAt = target.completedAt;
        loanTarget.disbursementRef = target.mpesaReceipt;
      }
    } else {
      target.status = 'failed';
      target.failureReason = 'Insufficient initiator balance';
    }
    saveDB(freshDb);
  }, 2000 + Math.random() * 3000);
  
  return txn;
}

export function simulateMpesaC2B(db: any, loanId: string, amount: number, phone: string): MpesaTransaction {
  const txn: MpesaTransaction = {
    id: genId('MP'),
    tenantId: CURRENT_TENANT,
    loanId,
    type: 'C2B',
    amount,
    phone,
    reference: loanId,
    status: 'completed',
    requestAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    mpesaReceipt: 'QKJ' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    retryCount: 0,
  };
  db.mpesaTransactions.push(txn);
  
  // Apply payment to loan
  const loan = db.loans.find((l: Loan) => l.id === loanId);
  if (loan) {
    loan.amountPaid += amount;
    loan.balance = Math.max(0, loan.totalRepayable - loan.amountPaid);
    const enforced = enforceInDuplum(loan);
    Object.assign(loan, enforced);
    if (loan.balance === 0) {
      loan.status = 'completed';
      loan.completedAt = new Date().toISOString();
    }
  }
  
  return txn;
}

// ---------------------------------------------------------------------------
// DECISION ENGINE — Scorecard + affordability (DE-001 to DE-007)
// ---------------------------------------------------------------------------
export function runDecisionEngine(db: any, loan: Loan, product: LoanProduct): {
  decision: 'approved' | 'rejected' | 'manual_review';
  score: number;
  reasons: string[];
} {
  const borrower = db.borrowers.find((b: any) => b.id === loan.borrowerId);
  if (!borrower) return { decision: 'rejected', score: 0, reasons: ['Borrower not found'] };
  
  let score = 50;
  const reasons: string[] = [];
  
  // KYC verified
  if (borrower.kycStatus === 'verified') { score += 15; }
  else { reasons.push('KYC not verified'); }
  
  // Income affordability — DTI check (SUI-001)
  if (borrower.monthlyIncome) {
    const dti = (loan.totalRepayable / borrower.monthlyIncome) * 100;
    if (dti > product.maxDti) {
      return { decision: 'rejected', score: 20, reasons: [`DTI ${dti.toFixed(1)}% exceeds max ${product.maxDti}%`] };
    }
    if (dti < 20) score += 20;
    else if (dti < 35) score += 10;
    else reasons.push(`High DTI: ${dti.toFixed(1)}%`);
  } else {
    reasons.push('Income not verified');
    score -= 10;
  }
  
  // Credit score
  if (borrower.creditScore) {
    if (borrower.creditScore >= 700) score += 15;
    else if (borrower.creditScore >= 600) score += 5;
    else { score -= 15; reasons.push('Low credit score'); }
  }
  
  // Loan amount vs auto-approve threshold
  if (loan.principal <= product.autoApproveThreshold) {
    score += 5;
  }
  
  // Consent check
  if (!hasConsent(db, borrower.id, 'credit_check')) {
    return { decision: 'rejected', score: 0, reasons: ['Credit check consent not given'] };
  }
  
  // Final decision
  if (score >= 75) return { decision: 'approved', score, reasons: ['Meets all criteria'] };
  if (score >= 55) return { decision: 'manual_review', score, reasons: ['Borderline — requires manual review'] };
  return { decision: 'rejected', score, reasons: reasons.length ? reasons : ['Does not meet minimum criteria'] };
}

// ---------------------------------------------------------------------------
// COMPLIANCE ALERT SERVICE
// ---------------------------------------------------------------------------
export function raiseAlert(
  db: any,
  type: ComplianceAlert['type'],
  severity: ComplianceAlert['severity'],
  title: string,
  description: string,
  entityType?: string,
  entityId?: string
): ComplianceAlert {
  const alert: ComplianceAlert = {
    id: genId('CA'),
    tenantId: CURRENT_TENANT,
    type,
    severity,
    title,
    description,
    entityType,
    entityId,
    resolved: false,
    createdAt: new Date().toISOString(),
  };
  db.alerts.push(alert);
  return alert;
}

// ---------------------------------------------------------------------------
// PAR CALCULATION
// ---------------------------------------------------------------------------
export function calculatePAR(db: any): { par30: number; par60: number; par90: number } {
  const activeLoans = db.loans.filter((l: Loan) => 
    ['active', 'overdue', 'disbursed'].includes(l.status)
  );
  const totalPortfolio = activeLoans.reduce((sum: number, l: Loan) => sum + l.balance, 0);
  if (totalPortfolio === 0) return { par30: 0, par60: 0, par90: 0 };
  
  const atRisk30 = activeLoans.filter((l: Loan) => l.daysPastDue >= 1).reduce((s: number, l: Loan) => s + l.balance, 0);
  const atRisk60 = activeLoans.filter((l: Loan) => l.daysPastDue >= 31).reduce((s: number, l: Loan) => s + l.balance, 0);
  const atRisk90 = activeLoans.filter((l: Loan) => l.daysPastDue >= 61).reduce((s: number, l: Loan) => s + l.balance, 0);
  
  return {
    par30: (atRisk30 / totalPortfolio) * 100,
    par60: (atRisk60 / totalPortfolio) * 100,
    par90: (atRisk90 / totalPortfolio) * 100,
  };
}
