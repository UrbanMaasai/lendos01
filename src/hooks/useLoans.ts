import { useDB } from '../contexts/DataContext';
import type { Loan, LoanProduct, Borrower } from '../db/schema';
import { genId, generateKFS, startCoolingOff, runDecisionEngine, simulateMpesaB2C, simulateMpesaC2B, enforceInDuplum, raiseAlert } from '../db/services';

export function useLoans() {
  const { db, mutate, audit } = useDB();
  
  const emptyState = {
    loans: [] as Loan[],
    products: [] as LoanProduct[],
    borrowers: [] as Borrower[],
    applyForLoan: async () => { throw new Error('DB not ready'); },
    acceptKFS: async () => { throw new Error('DB not ready'); },
    runDecision: async () => { throw new Error('DB not ready'); },
    disburse: async () => { throw new Error('DB not ready'); },
    recordRepayment: async () => { throw new Error('DB not ready'); },
  };
  
  if (!db) return emptyState;

  const loans = db.loans as Loan[];
  const products = db.products as LoanProduct[];
  const borrowers = db.borrowers as Borrower[];

  // Create new loan application
  const applyForLoan = async (borrowerId: string, productId: string, principal: number) => {
    const product = products.find(p => p.id === productId);
    const borrower = borrowers.find(b => b.id === borrowerId);
    if (!product || !borrower) throw new Error('Product or borrower not found');

    const interestAmount = product.interestMethod === 'flat'
      ? principal * (product.interestRate / 100)
      : principal * (product.interestRate / 100) * (product.tenureDays / 365); // Simplified
    const fees = product.processingFee || 0;
    const totalRepayable = principal + interestAmount + fees;
    const dueDate = new Date(Date.now() + product.tenureDays * 24 * 60 * 60 * 1000);

    const loan: Loan = {
      id: genId('LN'),
      tenantId: db._meta.tenantId,
      borrowerId,
      productId,
      applicationNumber: `APP-${new Date().getFullYear()}-${String(loans.length + 1).padStart(4, '0')}`,
      principal,
      interestRate: product.interestRate,
      interestAmount,
      fees,
      penalties: 0,
      totalRepayable,
      amountPaid: 0,
      balance: totalRepayable,
      inDuplumCap: principal * 2,
      inDuplumReached: false,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      dueDate: dueDate.toISOString().split('T')[0],
      daysPastDue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutate(d => { d.loans.push(loan); });
    await audit('LOAN_APPLIED', 'Loan', loan.id, `New loan application: KES ${principal.toLocaleString()} for ${product.name}`, undefined, loan);
    return loan;
  };

  // Accept KFS
  const acceptKFS = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    
    const product = products.find(p => p.id === loan.productId)!;
    const borrower = borrowers.find(b => b.id === loan.borrowerId)!;
    const kfs = generateKFS(loan, product, `${borrower.firstName} ${borrower.lastName}`);
    
    mutate(d => {
      const l = d.loans.find((x: Loan) => x.id === loanId);
      if (l) {
        l.status = 'cooling_off';
        l.kfsAcceptedAt = new Date().toISOString();
        const cooled = startCoolingOff(l, product.coolingOffHours);
        Object.assign(l, cooled);
        l.updatedAt = new Date().toISOString();
      }
    });
    await audit('KFS_ACCEPTED', 'Loan', loanId, `KFS v${kfs.version} accepted. Cooling-off period started.`, undefined, kfs);
  };

  // Run decision engine
  const runDecision = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    const product = products.find(p => p.id === loan.productId)!;
    
    const result = runDecisionEngine(db, loan, product);
    
    mutate(d => {
      const l = d.loans.find((x: Loan) => x.id === loanId);
      if (l) {
        l.status = result.decision === 'approved' ? 'approved' : result.decision === 'rejected' ? 'rejected' : 'decision_pending';
        l.decisionAt = new Date().toISOString();
        l.decisionBy = 'U-ADMIN';
        l.decisionReason = result.reasons.join('; ');
        l.updatedAt = new Date().toISOString();
      }
    });
    await audit('DECISION_RUN', 'Loan', loanId, `Decision: ${result.decision}. Score: ${result.score}/100. Reasons: ${result.reasons.join(', ')}`, undefined, result);
    return result;
  };

  // Disburse loan (M-Pesa B2C)
  const disburse = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    const borrower = borrowers.find(b => b.id === loan.borrowerId)!;
    
    const txn = simulateMpesaB2C(db, loan, borrower.phone);
    
    mutate(d => {
      const l = d.loans.find((x: Loan) => x.id === loanId);
      if (l) {
        l.status = 'disbursed';
        l.disbursedAt = new Date().toISOString();
        l.disbursementRef = txn.id;
        l.updatedAt = new Date().toISOString();
      }
    });
    await audit('LOAN_DISBURSED', 'Loan', loanId, `Disbursed KES ${loan.principal.toLocaleString()} via M-Pesa B2C to ${borrower.phone}. Txn: ${txn.id}`, undefined, txn);
    return txn;
  };

  // Record repayment (M-Pesa C2B)
  const recordRepayment = async (loanId: string, amount: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    const borrower = borrowers.find(b => b.id === loan.borrowerId)!;
    
    const before = { ...loan };
    const txn = simulateMpesaC2B(db, loanId, amount, borrower.phone);
    
    // Check in duplum after payment
    mutate(d => {
      const l = d.loans.find((x: Loan) => x.id === loanId);
      if (l) {
        const enforced = enforceInDuplum(l);
        Object.assign(l, enforced);
        l.updatedAt = new Date().toISOString();
        if (l.inDuplumReached && !before.inDuplumReached) {
          raiseAlert(d, 'in_duplum', 'high', 'In Duplum Limit Reached', `Loan ${l.id} reached 2× principal cap. Further charges blocked.`, 'Loan', l.id);
        }
      }
    });
    await audit('REPAYMENT_RECEIVED', 'Loan', loanId, `Received KES ${amount.toLocaleString()} via M-Pesa C2B. Receipt: ${txn.mpesaReceipt}`, before, db.loans.find((l: Loan) => l.id === loanId));
    return txn;
  };

  return {
    loans,
    products,
    borrowers,
    applyForLoan,
    acceptKFS,
    runDecision,
    disburse,
    recordRepayment,
  };
}
