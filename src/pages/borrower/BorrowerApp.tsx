import { useState, useEffect } from 'react';
import { useDB } from '../../contexts/DataContext';
import { useLoans } from '../../hooks/useLoans';
import { genId, hasConsent, grantConsent, generateKFS, startCoolingOff, runDecisionEngine, simulateMpesaB2C, simulateMpesaC2B } from '../../db/services';
import type { Loan, Borrower, LoanProduct } from '../../db/schema';
import ConsentPage from './Consent';
import KFSViewer from './KFSViewer';
import { 
  Phone, Shield, ChevronRight, CheckCircle, Clock, AlertCircle, 
  CreditCard, ArrowDownCircle, ArrowUpCircle, Wallet, LogOut,
  User, FileText, Home, Receipt
} from 'lucide-react';

type Step = 'register' | 'otp' | 'kyc' | 'consent' | 'kfs' | 'cooling_off' | 'dashboard' | 'apply' | 'repay';

export default function BorrowerApp() {
  const { db, mutate, audit, loading } = useDB();
  const { loans, products, borrowers } = useLoans();
  
  const [step, setStep] = useState<Step>('register');
  const [phone, setPhone] = useState('+2547');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [currentBorrowerId, setCurrentBorrowerId] = useState<string | null>(null);
  const [currentLoanId, setCurrentLoanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'loans' | 'repay'>('home');
  const [repayAmount, setRepayAmount] = useState(0);
  const [stkPushSent, setStkPushSent] = useState(false);
  const [error, setError] = useState('');

  if (loading || !db) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Register
  const handleRegister = () => {
    if (phone.length < 12) {
      setError('Enter a valid phone number');
      return;
    }
    // Generate OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpSent(generatedOtp);
    setStep('otp');
    setError('');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (otp !== otpSent) {
      setError('Invalid OTP. Hint: ' + otpSent);
      return;
    }
    // Check if borrower exists
    const existing = borrowers.find(b => b.phone === phone);
    if (existing) {
      setCurrentBorrowerId(existing.id);
      if (hasConsent(db, existing.id, 'data_processing')) {
        setStep('dashboard');
      } else {
        setStep('consent');
      }
    } else {
      setStep('kyc');
    }
    setError('');
  };

  // Complete KYC
  const handleCompleteKYC = () => {
    if (!firstName || !lastName || !idNumber || !monthlyIncome) {
      setError('Please fill all fields');
      return;
    }
    const newBorrower: Borrower = {
      id: genId('BR'),
      tenantId: db._meta.tenantId,
      phone,
      firstName,
      lastName,
      idNumber,
      kycStatus: 'verified',
      kycVerifiedAt: new Date().toISOString(),
      monthlyIncome: parseInt(monthlyIncome),
      employmentStatus: 'employed',
      createdAt: new Date().toISOString(),
    };
    mutate(d => { d.borrowers.push(newBorrower); });
    setCurrentBorrowerId(newBorrower.id);
    audit('BORROWER_REGISTERED', 'Borrower', newBorrower.id, `New borrower registered: ${firstName} ${lastName}`);
    setStep('consent');
    setError('');
  };

  // After consent
  const handleConsentComplete = () => {
    setStep('dashboard');
  };

  // Apply for loan
  const handleApply = async (productId: string, amount: number) => {
    if (!currentBorrowerId) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const interestAmount = product.interestMethod === 'flat'
      ? amount * (product.interestRate / 100)
      : amount * (product.interestRate / 100) * (product.tenureDays / 365);
    const fees = product.processingFee || 0;
    const totalRepayable = amount + interestAmount + fees;
    const dueDate = new Date(Date.now() + product.tenureDays * 24 * 60 * 60 * 1000);

    const loan: Loan = {
      id: genId('LN'),
      tenantId: db._meta.tenantId,
      borrowerId: currentBorrowerId,
      productId,
      applicationNumber: `APP-${new Date().getFullYear()}-${String(db.loans.length + 1).padStart(4, '0')}`,
      principal: amount,
      interestRate: product.interestRate,
      interestAmount,
      fees,
      penalties: 0,
      totalRepayable,
      amountPaid: 0,
      balance: totalRepayable,
      inDuplumCap: amount * 2,
      inDuplumReached: false,
      status: 'kfs_pending',
      appliedAt: new Date().toISOString(),
      dueDate: dueDate.toISOString().split('T')[0],
      daysPastDue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutate(d => { d.loans.push(loan); });
    setCurrentLoanId(loan.id);
    await audit('LOAN_APPLIED', 'Loan', loan.id, `Borrower applied for KES ${amount.toLocaleString()} ${product.name}`);
    setStep('kfs');
  };

  // Accept KFS
  const handleAcceptKFS = async () => {
    if (!currentLoanId) return;
    mutate(d => {
      const loan = d.loans.find((l: Loan) => l.id === currentLoanId);
      if (loan) {
        loan.status = 'cooling_off';
        loan.kfsAcceptedAt = new Date().toISOString();
        const product = d.products.find((p: LoanProduct) => p.id === loan.productId);
        if (product) {
          const start = new Date();
          const end = new Date(start.getTime() + product.coolingOffHours * 60 * 60 * 1000);
          loan.coolingOffStartsAt = start.toISOString();
          loan.coolingOffEndsAt = end.toISOString();
        }
        loan.updatedAt = new Date().toISOString();
      }
    });
    await audit('KFS_ACCEPTED', 'Loan', currentLoanId, 'KFS accepted by borrower. Cooling-off started.');
    setStep('cooling_off');
  };

  // After cooling off - auto approve and disburse
  const handleProceedAfterCooling = async () => {
    if (!currentLoanId || !currentBorrowerId) return;
    
    // Run decision
    const loan = db.loans.find((l: Loan) => l.id === currentLoanId);
    if (!loan) return;
    const product = products.find(p => p.id === loan.productId);
    if (!product) return;
    
    const decision = runDecisionEngine(db, loan, product);
    
    mutate(d => {
      const l = d.loans.find((x: Loan) => x.id === currentLoanId);
      if (l) {
        if (decision.decision === 'approved') {
          l.status = 'approved';
          l.decisionAt = new Date().toISOString();
          l.decisionReason = `Score: ${decision.score}/100`;
          // Auto-disburse
          const borrower = d.borrowers.find((b: Borrower) => b.id === currentBorrowerId);
          if (borrower) {
            const txn = simulateMpesaB2C(d, l, borrower.phone);
            l.status = 'disbursed';
            l.disbursedAt = new Date().toISOString();
            l.disbursementRef = txn.id;
          }
        } else {
          l.status = 'rejected';
          l.decisionReason = decision.reasons.join('; ');
        }
        l.updatedAt = new Date().toISOString();
      }
    });
    await audit('DECISION_RUN', 'Loan', currentLoanId, `Decision: ${decision.decision}. Score: ${decision.score}`);
    setStep('dashboard');
    setActiveTab('loans');
  };

  // Repay
  const handleRepay = async () => {
    if (!currentLoanId || repayAmount <= 0) return;
    setStkPushSent(true);
    
    // Simulate STK Push
    setTimeout(async () => {
      const borrower = borrowers.find(b => b.id === currentBorrowerId);
      mutate(d => {
        const loan = d.loans.find((l: Loan) => l.id === currentLoanId);
        if (loan) {
          const txn = simulateMpesaC2B(d, currentLoanId!, repayAmount, borrower?.phone || phone);
          loan.updatedAt = new Date().toISOString();
        }
      });
      await audit('STK_PUSH_REPAYMENT', 'Loan', currentLoanId, `STK Push repayment: KES ${repayAmount.toLocaleString()}`);
      setStkPushSent(false);
      setRepayAmount(0);
      setActiveTab('loans');
    }, 3000);
  };

  // Get borrower's loans
  const myLoans = currentBorrowerId 
    ? loans.filter(l => l.borrowerId === currentBorrowerId)
    : [];
  const activeLoan = myLoans.find(l => ['active', 'disbursed', 'overdue'].includes(l.status));

  // ============ RENDER STEPS ============

  // Register
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-emerald-600 font-bold text-3xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-emerald-100 text-sm">Fast, fair, transparent lending</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter your phone number</h2>
            <div className="relative mb-4">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                placeholder="+254 7XX XXX XXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button
              onClick={handleRegister}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Continue
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    );
  }

  // OTP
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-gray-900">Verify Phone</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter OTP</h2>
            <p className="text-sm text-gray-500 mb-4">We sent a code to {phone}</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(''); }}
              placeholder="Enter 4-digit code"
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
            />
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700"
            >
              Verify
            </button>
            <button onClick={() => setStep('register')} className="w-full text-sm text-gray-500 mt-3">
              ← Change number
            </button>
          </div>
        </div>
      </div>
    );
  }

  // KYC
  if (step === 'kyc') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-gray-900">Verify Your Identity</span>
          </div>
        </div>
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Tell us about yourself</h2>
          <p className="text-sm text-gray-500 mb-6">Required for regulatory compliance</p>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Jane" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Wanjiku" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">National ID Number</label>
              <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="e.g. 12345678" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Monthly Income (KES)</label>
              <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="e.g. 35000" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

          <button
            onClick={handleCompleteKYC}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 mt-6"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Consent
  if (step === 'consent' && currentBorrowerId) {
    return <ConsentPage borrowerId={currentBorrowerId} onComplete={handleConsentComplete} />;
  }

  // KFS
  if (step === 'kfs' && currentLoanId) {
    const loan = loans.find(l => l.id === currentLoanId);
    const product = products.find(p => p.id === loan?.productId);
    if (loan && product) {
      return (
        <KFSViewer
          loan={{
            principal: loan.principal,
            interestRate: loan.interestRate,
            interestMethod: product.interestMethod,
            tenureDays: product.tenureDays,
            processingFee: loan.fees,
            totalRepayable: loan.totalRepayable,
            dueDate: loan.dueDate,
            productName: product.name,
            inDuplumCap: loan.inDuplumCap,
          }}
          onAccept={handleAcceptKFS}
        />
      );
    }
  }

  // Cooling Off
  if (step === 'cooling_off') {
    const loan = loans.find(l => l.id === currentLoanId);
    const endsAt = loan?.coolingOffEndsAt ? new Date(loan.coolingOffEndsAt) : new Date(Date.now() + 30000);
    const canProceed = new Date() >= endsAt;
    const remainingMs = Math.max(0, endsAt.getTime() - Date.now());
    const remainingMin = Math.floor(remainingMs / 60000);
    const remainingSec = Math.floor((remainingMs % 60000) / 1000);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-purple-600" />
            <span className="font-semibold text-gray-900">Cooling-Off Period</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <Clock size={36} className="text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Reflection Period</h2>
          <p className="text-sm text-gray-600 mb-6">
            You have a 24-hour cooling-off period to reconsider. You can cancel without penalty.
          </p>
          
          {canProceed ? (
            <div className="w-full">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <CheckCircle size={20} className="text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800 font-medium">Cooling-off period complete</p>
                <p className="text-xs text-green-600 mt-1">Your loan is being processed</p>
              </div>
              <button
                onClick={handleProceedAfterCooling}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold text-purple-700 font-mono">
                  {String(remainingMin).padStart(2, '0')}:{String(remainingSec).padStart(2, '0')}
                </div>
                <p className="text-xs text-purple-600 mt-1">remaining</p>
              </div>
              <button
                onClick={() => {
                  // Skip cooling off for demo
                  mutate(d => {
                    const l = d.loans.find((x: Loan) => x.id === currentLoanId);
                    if (l) l.coolingOffEndsAt = new Date(Date.now() - 1000).toISOString();
                  });
                  setTimeout(() => handleProceedAfterCooling(), 500);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-300"
              >
                Skip (Demo Mode)
              </button>
              <button
                onClick={() => {
                  mutate(d => {
                    const l = d.loans.find((x: Loan) => x.id === currentLoanId);
                    if (l) l.status = 'rejected';
                  });
                  setStep('dashboard');
                }}
                className="w-full text-sm text-red-600 mt-3 font-medium"
              >
                Cancel this loan
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs opacity-80">Karibu</p>
            <p className="font-semibold">
              {currentBorrowerId ? borrowers.find(b => b.id === currentBorrowerId)?.firstName : 'User'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full pb-20">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Balance Card */}
            {activeLoan ? (
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Outstanding Balance</p>
                <p className="text-3xl font-bold text-gray-900">KES {activeLoan.balance.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(activeLoan.dueDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => { setCurrentLoanId(activeLoan.id); setRepayAmount(Math.min(5000, activeLoan.balance)); setActiveTab('repay'); }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    Repay Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center">
                <Wallet size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active loans</p>
              </div>
            )}

            {/* Products */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Available Products</h3>
              <div className="space-y-3">
                {products.filter(p => p.status === 'active').map(product => (
                  <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.tenureDays}-day tenure • {product.interestRate}% interest</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        APR {product.apr}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        KES {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => { setCurrentLoanId(null); setStep('apply'); }}
                        className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"
                      >
                        Apply <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">My Loans</h3>
            {myLoans.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No loans yet</p>
              </div>
            ) : (
              myLoans.map(loan => {
                const product = products.find(p => p.id === loan.productId);
                return (
                  <div key={loan.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-400">{loan.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                        loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{product?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Principal</p>
                        <p className="text-sm font-semibold">KES {loan.principal.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-sm font-semibold">KES {loan.balance.toLocaleString()}</p>
                      </div>
                    </div>
                    {loan.inDuplumReached && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-700">
                        In duplum limit reached — no further charges
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'repay' && activeLoan && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Repay Loan</h3>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Loan {activeLoan.id}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">KES {activeLoan.balance.toLocaleString()}</p>
              <p className="text-xs text-gray-500">outstanding balance</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Amount to repay</label>
              <input
                type="number"
                value={repayAmount}
                onChange={e => setRepayAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-semibold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="flex gap-2 mt-2">
                {[1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setRepayAmount(Math.min(amt, activeLoan.balance))}
                    className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    KES {amt.toLocaleString()}
                  </button>
                ))}
                <button
                  onClick={() => setRepayAmount(activeLoan.balance)}
                  className="flex-1 py-2 bg-emerald-100 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                >
                  Full
                </button>
              </div>
            </div>

            {stkPushSent ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-blue-900">STK Push sent to your phone</p>
                <p className="text-xs text-blue-600 mt-1">Enter your M-Pesa PIN to complete payment</p>
              </div>
            ) : (
              <button
                onClick={handleRepay}
                disabled={repayAmount <= 0 || repayAmount > activeLoan.balance}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Pay via M-Pesa
              </button>
            )}

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Paybill:</strong> 247247<br />
                <strong>Account:</strong> {activeLoan.id}<br />
                <strong>Amount:</strong> KES {repayAmount.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Apply Step (inline) */}
        {step === 'apply' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Apply for a Loan</h3>
            {products.filter(p => p.status === 'active').map(product => (
              <ApplyCard key={product.id} product={product} onApply={handleApply} />
            ))}
            <button onClick={() => setStep('dashboard')} className="w-full text-sm text-gray-500">
              ← Back to dashboard
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'loans', icon: FileText, label: 'Loans' },
            { id: 'repay', icon: Receipt, label: 'Repay' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); if (tab.id === 'repay' && activeLoan) { setCurrentLoanId(activeLoan.id); setRepayAmount(Math.min(5000, activeLoan.balance)); } }}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Apply Card Component
function ApplyCard({ product, onApply }: { product: LoanProduct; onApply: (productId: string, amount: number) => void }) {
  const [amount, setAmount] = useState(product.minAmount);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
      <p className="text-xs text-gray-500 mb-3">
        KES {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()} • {product.tenureDays} days • {product.interestRate}% interest
      </p>
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-700 mb-1 block">Amount</label>
        <input
          type="range"
          min={product.minAmount}
          max={product.maxAmount}
          step={1000}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>KES {product.minAmount.toLocaleString()}</span>
          <span className="font-semibold text-emerald-700">KES {amount.toLocaleString()}</span>
          <span>KES {product.maxAmount.toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Interest</span>
          <span className="font-medium">KES {Math.round(amount * product.interestRate / 100).toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 mt-1 pt-1 border-t border-gray-200">
          <span>Total Repayable</span>
          <span>KES {(amount + Math.round(amount * product.interestRate / 100) + (product.processingFee || 0)).toLocaleString()}</span>
        </div>
      </div>
      <button
        onClick={() => onApply(product.id, amount)}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700"
      >
        Apply Now
      </button>
    </div>
  );
}
