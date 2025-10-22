export type Income = {
  id: string;
  name: string;
  amount: number;
};

export type Expense = {
  id: string;
  name: string;
  amount: number;
};

export type AmortizationScheduleEntry = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'pending' | 'paid' | 'skipped';
  paymentDate?: string; // ISO date string
};

export type Loan = {
  id: string;
  name: string;
  principal: number;
  rate: number;
  years: number;
  startDateYear: number;
  startDateMonth: number;
  extraPrincipal: number; // monthly extra payment
  schedule?: AmortizationScheduleEntry[];
};

export type LoanConfig = Omit<Loan, 'extraPrincipal'>;

export type MonthlyLoanData = {
  id: string;
  extraPrincipal: number;
};

export type MonthData = {
  incomes: Income[];
  expenses: Expense[];
  monthlyLoanData: MonthlyLoanData[];
};

export type AppData = {
  incomes: Income[];
  expenses: Expense[];
  wants: Expense[];
  investments?: Expense[];
  loans: Loan[];
};

export type LoanStatus = {
  emi: number;
  startBalance: number;
  endBalance: number;
  interestPaid: number;
  principalPaid: number;
  extraPrincipal: number;
  paymentsMadeTotal: number;
  paymentsRemaining: number;
  currentOutstandingBalance: number;
  isPaidOff: boolean;
  nextPayment?: AmortizationScheduleEntry & { dueDate: Date };
  overduePayments: (AmortizationScheduleEntry & { dueDate: Date })[];
};

export type SyncStatus = 'loading' | 'synced-cloud' | 'synced-local' | 'error';
