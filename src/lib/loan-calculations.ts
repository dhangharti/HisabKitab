import type { Loan, LoanStatus, AmortizationScheduleEntry } from './types';

export const calculateEMI = (principal: number, annualRate: number, years: number): number => {
    const rate = annualRate / 12 / 100;
    const months = years * 12;

    if (principal <= 0 || months <= 0 || rate <= 0) return 0;

    const power = Math.pow(1 + rate, months);
    const emi = principal * rate * power / (power - 1);
    return emi;
};

export const generateLoanSchedule = (loan: Omit<Loan, 'id' | 'schedule'>): AmortizationScheduleEntry[] => {
  const { principal, rate, years } = loan;
  const monthlyRate = rate / 12 / 100;
  const totalMonths = years * 12;
  const emi = calculateEMI(principal, rate, years);

  if (emi === 0) return [];

  let balance = principal;
  const schedule: AmortizationScheduleEntry[] = [];

  for (let i = 0; i < totalMonths; i++) {
    if (balance <= 0.01) break;

    const interest = balance * monthlyRate;
    const principalPayment = emi - interest;
    
    let paymentAmount = emi;
    let finalPrincipalPayment = principalPayment;

    if (balance < emi) {
        finalPrincipalPayment = balance;
        paymentAmount = balance + interest;
    }
    
    balance -= finalPrincipalPayment;

    schedule.push({
      month: i + 1,
      payment: paymentAmount,
      principal: finalPrincipalPayment,
      interest: interest,
      balance: balance < 0.01 ? 0 : balance,
      status: 'pending',
    });
  }

  return schedule;
}

export const getPaymentDate = (loan: Loan, monthNumber: number): Date => {
    const startYear = loan.startDateYear;
    const startMonth = loan.startDateMonth -1; // 0-indexed month
    const totalMonths = startMonth + monthNumber -1;
    const year = startYear + Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    return new Date(year, month, 1); // Assuming payment is due on the 1st
};

export const calculateLoanStatus = (loan: Loan, targetYearBs: number, targetMonthBs: number): LoanStatus => {
    const totalMonths = loan.years * 12;
    const emi = calculateEMI(loan.principal, loan.rate, loan.years);

    if (!loan.schedule || loan.schedule.length === 0) {
        const isPaidOff = loan.principal <= 0;
        return {
            emi, startBalance: 0, endBalance: 0, interestPaid: 0, principalPaid: 0, extraPrincipal: 0,
            paymentsMadeTotal: 0, paymentsRemaining: 0, currentOutstandingBalance: loan.principal, isPaidOff,
            overduePayments: []
        };
    }
    
    const targetDate = new Date(targetYearBs, targetMonthBs - 1, 1);
    
    let currentOutstandingBalance = loan.principal;
    let paymentsMadeTotal = 0;
    let nextPayment: (AmortizationScheduleEntry & { dueDate: Date }) | undefined = undefined;
    const overduePayments: (AmortizationScheduleEntry & { dueDate: Date })[] = [];
    
    for (const payment of loan.schedule) {
        const dueDate = getPaymentDate(loan, payment.month);

        if (payment.status === 'paid') {
            currentOutstandingBalance = payment.balance;
            paymentsMadeTotal++;
        } else {
             if (dueDate < targetDate) {
                overduePayments.push({ ...payment, dueDate });
            }
            if (!nextPayment && dueDate >= targetDate) {
                nextPayment = { ...payment, dueDate };
            }
        }
    }
    
    // Find the latest paid payment to determine current balance
    const lastPaidPayment = [...loan.schedule].reverse().find(p => p.status === 'paid');
    if (lastPaidPayment) {
        currentOutstandingBalance = lastPaidPayment.balance;
    } else {
        currentOutstandingBalance = loan.principal;
    }


    const isPaidOff = currentOutstandingBalance <= 0.01 && overduePayments.length === 0;
     
    const statusForCurrentMonth = loan.schedule.find(p => {
        const dueDate = getPaymentDate(loan, p.month);
        return dueDate.getFullYear() === targetYearBs && dueDate.getMonth() === targetMonthBs -1;
    })


    return {
        emi,
        startBalance: lastPaidPayment ? lastPaidPayment.balance : loan.principal,
        endBalance: currentOutstandingBalance,
        interestPaid: statusForCurrentMonth?.interest ?? 0,
        principalPaid: (statusForCurrentMonth?.principal ?? 0) + loan.extraPrincipal,
        extraPrincipal: loan.extraPrincipal,
        paymentsMadeTotal,
        paymentsRemaining: totalMonths - paymentsMadeTotal,
        currentOutstandingBalance,
        isPaidOff,
        nextPayment,
        overduePayments
    };
};
