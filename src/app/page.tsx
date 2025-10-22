
"use client";

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  AppData,
  Loan,
  Income,
  Expense,
  LoanStatus,
  SyncStatus,
  AmortizationScheduleEntry,
} from '@/lib/types';
import {
  INITIAL_DATA,
  INITIAL_LOAN_CONFIG,
  BS_MONTHS,
} from '@/lib/constants';
import { calculateLoanStatus, generateLoanSchedule } from '@/lib/loan-calculations';

import { Header } from '@/components/dashboard/Header';
import { MonthNavigator } from '@/components/dashboard/MonthNavigator';
import { ItemList } from '@/components/dashboard/ItemList';
import { BudgetCategory } from '@/components/dashboard/BudgetCategory';
import { LoanTotalsSummary } from '@/components/dashboard/LoanTotalsSummary';
import { LoanCard } from '@/components/dashboard/LoanCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronLeft, ChevronRight, AlertTriangle, Settings } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const getTodayBs = () => {
    // This is a simplified conversion, a proper library should be used for accuracy
    const gregorianDate = new Date();
    const bsYear = gregorianDate.getFullYear() + 56 + (gregorianDate.getMonth() > 2 ? 1 : 0);
    // This is a rough estimation for month
    const bsMonth = (gregorianDate.getMonth() + 9) % 12 + 1; 
    return { year: bsYear, month: bsMonth };
  };

  const [currentYearBs, setCurrentYearBs] = useState(getTodayBs().year);
  const [currentMonthBs, setCurrentMonthBs] = useState(getTodayBs().month);
  
  const [appData, setAppData] = useState<AppData>(INITIAL_DATA);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState('...');
  const [dashboardName, setDashboardName] = useState('Financial Dashboard');
  const [budgetAllocation, setBudgetAllocation] = useState({ needs: 50, investments: 40, wants: 10 });
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  useEffect(() => {
    if(user && firestore && syncStatus !== 'synced-cloud' && syncStatus !== 'error') {
      setSyncStatus('loading');
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if(docSnap.exists()){
          const userData = docSnap.data();
          if(userData.familyGroupId) {
            setFamilyId(userData.familyGroupId)
          } else {
            //Create a random family Id
            const newFamilyId = `FM${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            setFamilyId(newFamilyId);
          }
          if (userData.dashboardName) {
            setDashboardName(userData.dashboardName);
          }
        }
      });
      
      const dataDocRef = doc(firestore, 'user_data', user.uid);
      getDoc(dataDocRef).then(docSnap => {
        if(docSnap.exists()){
          setAppData(docSnap.data() as AppData);
        } else {
            // No data found, save initial data
            setDocumentNonBlocking(dataDocRef, INITIAL_DATA);
            setAppData(INITIAL_DATA);
        }
        setSyncStatus('synced-cloud');
      }).catch(err => {
          console.error("Error fetching user data:", err);
          setSyncStatus('error');
          toast({
            variant: "destructive",
            title: "Error loading data",
            description: "Could not fetch your financial data from the cloud."
          });
      });
    }
  }, [user, firestore, toast, syncStatus]);

  const saveData = (newAppData: AppData) => {
    setAppData(newAppData);
    if(user && firestore) {
      const dataDocRef = doc(firestore, 'user_data', user.uid);
      setSyncStatus('loading');
      setDocumentNonBlocking(dataDocRef, newAppData);
      // In a real app you would handle the promise, for now we assume it works
      // and optimistically update the UI.
      setTimeout(() => setSyncStatus('synced-cloud'), 1000);
    }
  }
  
  const handleDateChange = (year: number, month: number) => {
    setCurrentYearBs(year);
    setCurrentMonthBs(month);
  };

  const updateIncome = (index: number, updatedIncome: Income) => {
    const newIncomes = [...(appData.incomes || [])];
    newIncomes[index] = updatedIncome;
    saveData({ ...appData, incomes: newIncomes });
  };

  const addIncome = () => {
    const newIncome: Income = {
      id: crypto.randomUUID(),
      name: 'नयाँ आय स्रोत',
      amount: 0,
    };
    saveData({ ...appData, incomes: [...(appData.incomes || []), newIncome] });
  };

  const deleteIncome = (index: number) => {
    const newIncomes = (appData.incomes || []).filter((_, i) => i !== index);
    saveData({ ...appData, incomes: newIncomes });
  };

  const updateExpense = (index: number, updatedExpense: Expense) => {
    const newExpenses = [...(appData.expenses || [])];
    newExpenses[index] = updatedExpense;
    saveData({ ...appData, expenses: newExpenses });
  };

  const addExpense = () => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      name: 'नयाँ आवश्यकता',
      amount: 0,
    };
    saveData({ ...appData, expenses: [...(appData.expenses || []), newExpense] });
  };

  const deleteExpense = (index: number) => {
    const newExpenses = (appData.expenses || []).filter((_, i) => i !== index);
    saveData({ ...appData, expenses: newExpenses });
  };

  const updateWant = (index: number, updatedWant: Expense) => {
    const newWants = [...(appData.wants || [])];
    newWants[index] = updatedWant;
    saveData({ ...appData, wants: newWants });
  };

  const addWant = () => {
    const newWant: Expense = {
      id: crypto.randomUUID(),
      name: 'नयाँ चाहना',
      amount: 0,
    };
    saveData({ ...appData, wants: [...(appData.wants || []), newWant] });
  };

  const deleteWant = (index: number) => {
    const newWants = (appData.wants || []).filter((_, i) => i !== index);
    saveData({ ...appData, wants: newWants });
  };
  
  const addInvestment = () => {
    const newInvestment: Expense = {
      id: crypto.randomUUID(),
      name: 'नयाँ लगानी',
      amount: 0,
    };
    saveData({ ...appData, investments: [...(appData.investments || []), newInvestment] });
  };

  const updateInvestment = (index: number, updatedInvestment: Expense) => {
    const newInvestments = [...(appData.investments || [])];
    newInvestments[index] = updatedInvestment;
    saveData({ ...appData, investments: newInvestments });
  };

  const deleteInvestment = (index: number) => {
    const newInvestments = (appData.investments || []).filter((_, i) => i !== index);
    saveData({ ...appData, investments: newInvestments });
  };

  const addLoan = () => {
    const loanConfig = {
        ...INITIAL_LOAN_CONFIG,
        id: crypto.randomUUID(),
        name: `नयाँ ऋण ${(appData.loans || []).length + 1}`,
    };
    const schedule = generateLoanSchedule(loanConfig);
    const newLoan: Loan = { ...loanConfig, extraPrincipal: 0, schedule };
    saveData({ ...appData, loans: [...(appData.loans || []), newLoan] });
  };

  const updateLoan = (loanId: string, field: keyof Loan, value: any) => {
    const newLoans = (appData.loans || []).map((loan) => {
      if (loan.id === loanId) {
        const updatedLoan = { ...loan, [field]: value };
         // Regenerate schedule if core details change
        if (['principal', 'rate', 'years', 'startDateYear', 'startDateMonth'].includes(field as string)) {
            updatedLoan.schedule = generateLoanSchedule(updatedLoan);
        }
        return updatedLoan;
      }
      return loan;
    });
    saveData({ ...appData, loans: newLoans });
  };
  
  const handleMarkAsPaid = (loanId: string, month: number) => {
    const newLoans = (appData.loans || []).map(loan => {
      if (loan.id === loanId) {
        const newSchedule = loan.schedule?.map(p => {
          if (p.month === month) {
            return { ...p, status: 'paid', paymentDate: new Date().toISOString() };
          }
          return p;
        });
        return { ...loan, schedule: newSchedule };
      }
      return loan;
    });
    saveData({ ...appData, loans: newLoans });
  };

  const confirmDeleteLoan = () => {
    if (loanToDelete) {
      const newLoans = (appData.loans || []).filter((loan) => loan.id !== loanToDelete);
      saveData({ ...appData, loans: newLoans });
      setLoanToDelete(null);
    }
  };

  const loanStatuses = useMemo<Record<string, LoanStatus>>(() => {
    const statuses: Record<string, LoanStatus> = {};
    (appData.loans || []).forEach((loan) => {
      statuses[loan.id] = calculateLoanStatus(
        loan,
        currentYearBs,
        currentMonthBs
      );
    });
    return statuses;
  }, [appData.loans, currentYearBs, currentMonthBs]);

  const totals = useMemo(() => {
    const totalIncome = (appData.incomes || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const totalNeedsExpenses = (appData.expenses || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const totalWants = (appData.wants || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const totalManualInvestments = (appData.investments || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const {
      totalPrincipalReduction,
      totalOutstanding,
      totalScheduledEMI,
      longestRemaining,
      totalInterest,
    } = Object.values(loanStatuses).reduce(
      (acc, status) => {
        const currentMonthPayment = status.nextPayment?.dueDate.getFullYear() === currentYearBs && status.nextPayment?.dueDate.getMonth() === currentMonthBs - 1
            ? status.nextPayment
            : null;

        acc.totalPrincipalReduction += currentMonthPayment ? currentMonthPayment.principal : 0;
        acc.totalInterest += currentMonthPayment ? currentMonthPayment.interest : 0;
        acc.totalOutstanding += status.currentOutstandingBalance;
        acc.totalScheduledEMI += status.emi;
        
        if (status.paymentsRemaining > acc.longestRemaining) {
          acc.longestRemaining = status.paymentsRemaining;
        }
        return acc;
      },
      {
        totalPrincipalReduction: 0,
        totalOutstanding: 0,
        totalScheduledEMI: 0,
        longestRemaining: 0,
        totalInterest: 0,
      }
    );

    const totalNeeds = totalNeedsExpenses + totalInterest;
    const totalInvestments = totalPrincipalReduction + totalManualInvestments;
    
    // Budget calculations
    const needsBudget = totalIncome * (budgetAllocation.needs / 100);
    const investmentsBudget = totalIncome * (budgetAllocation.investments / 100);
    const wantsBudget = totalIncome * (budgetAllocation.wants / 100);
    
    const remainingNeeds = needsBudget - totalNeeds;
    const remainingInvestments = investmentsBudget - totalInvestments;
    const remainingWants = wantsBudget - totalWants;

    const netCashFlow = totalIncome - totalNeeds - totalWants - totalInvestments;

    return {
      totalIncome,
      totalNeeds,
      totalWants,
      totalInvestments,
      netCashFlow,
      totalOutstanding,
      totalScheduledEMI,
      longestRemaining,
      // Budget items
      needsBudget,
      investmentsBudget,
      wantsBudget,
      remainingNeeds,
      remainingInvestments,
      remainingWants,
      totalManualInvestments,
      totalPrincipalReduction,
    };
  }, [appData, loanStatuses, currentYearBs, currentMonthBs, budgetAllocation]);

  const handleNavigateMonth = useCallback(
    (direction: 1 | -1) => {
      let newYear = currentYearBs;
      let newMonth = currentMonthBs + direction;

      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      handleDateChange(newYear, newMonth);
    },
    [currentYearBs, currentMonthBs]
  );
  
  const handleBudgetSave = (newAllocation: { needs: number, investments: number, wants: number }) => {
    const total = newAllocation.needs + newAllocation.investments + newAllocation.wants;
    if (total !== 100) {
      toast({
        variant: "destructive",
        title: "Invalid Allocation",
        description: "The total allocation must be 100%.",
      });
      return;
    }
    setBudgetAllocation(newAllocation);
    setIsBudgetModalOpen(false);
  };


  if (isUserLoading || !user || syncStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Header
            dashboardName={dashboardName}
            syncStatus={syncStatus}
            familyId={familyId}
            onSignOut={() => auth?.signOut()}
          />

          <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
            {/* Left Column */}
            <div className="lg:col-span-3 bg-card p-4 sm:p-6 rounded-xl shadow-lg border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  मासिक बजेट र खर्च
                </h2>
                <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      बजेट मिलाउनुहोस्
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Customize Budget Allocation</DialogTitle>
                      <DialogDescription>
                        Adjust the percentages for your budget categories. The total must be 100%.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="needs" className="text-right">Needs</Label>
                        <Input id="needs" type="number" defaultValue={budgetAllocation.needs} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="investments" className="text-right">Investments</Label>
                        <Input id="investments" type="number" defaultValue={budgetAllocation.investments} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="wants" className="text-right">Wants</Label>
                        <Input id="wants" type="number" defaultValue={budgetAllocation.wants} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        const needs = parseInt((document.getElementById('needs') as HTMLInputElement).value) || 0;
                        const investments = parseInt((document.getElementById('investments') as HTMLInputElement).value) || 0;
                        const wants = parseInt((document.getElementById('wants') as HTMLInputElement).value) || 0;
                        handleBudgetSave({ needs, investments, wants });
                      }}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <MonthNavigator
                currentYear={currentYearBs}
                currentMonth={currentMonthBs}
                onYearChange={(y) => handleDateChange(y, currentMonthBs)}
                onMonthChange={(m) => handleDateChange(currentYearBs, m)}
                onNavigate={handleNavigateMonth}
              />

              <div className="mt-6 space-y-4">
                <ItemList
                  title="आम्दानी (Income)"
                  items={appData.incomes || []}
                  total={totals.totalIncome}
                  onAddItem={addIncome}
                  onUpdateItem={updateIncome}
                  onDeleteItem={deleteIncome}
                  colorClass="text-green-500"
                  borderColorClass="border-green-500"
                  buttonText="आय"
                />
              </div>
              
              {totals.totalIncome > 0 && (
                <div className="mt-6 space-y-6">
                    <BudgetCategory
                      title="आवश्यकता (Needs)"
                      rule={`${budgetAllocation.needs}%`}
                      budget={totals.needsBudget}
                      spent={totals.totalNeeds}
                      remaining={totals.remainingNeeds}
                      colorClass="primary-red"
                      items={appData.expenses || []}
                      onAddItem={addExpense}
                      onUpdateItem={updateExpense}
                      onDeleteItem={deleteExpense}
                      buttonText="आवश्यकता थप्नुहोस्"
                    />
                    <BudgetCategory
                      title="लगानी (Investments)"
                      rule={`${budgetAllocation.investments}%`}
                      budget={totals.investmentsBudget}
                      spent={totals.totalInvestments}
                      remaining={totals.remainingInvestments}
                      colorClass="primary-green"
                      items={appData.investments || []}
                      onAddItem={addInvestment}
                      onUpdateItem={updateInvestment}
                      onDeleteItem={deleteInvestment}
                      buttonText="लगानी थप्नुहोस्"
                      loanPrincipal={totals.totalPrincipalReduction}
                    />
                    <BudgetCategory
                      title="चाहना (Wants)"
                      rule={`${budgetAllocation.wants}%`}
                      budget={totals.wantsBudget}
                      spent={totals.totalWants}
                      remaining={totals.remainingWants}
                      colorClass="primary-blue"
                      items={appData.wants || []}
                      onAddItem={addWant}
                      onUpdateItem={updateWant}
                      onDeleteItem={deleteWant}
                      buttonText="चाहना थप्नुहोस्"
                    />
                </div>
              )}

              {totals.remainingNeeds < 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>बजेट चेतावनी</AlertTitle>
                  <AlertDescription>
                    तपाईंले आफ्नो 'आवश्यकता' बजेट पार गर्नुभएको छ!
                  </AlertDescription>
                </Alert>
              )}
               {totals.remainingInvestments < 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>बजेट चेतावनी</AlertTitle>
                  <AlertDescription>
                    तपाईंले आफ्नो 'लगानी' बजेट पार गर्नुभएको छ!
                  </AlertDescription>
                </Alert>
              )}
               {totals.remainingWants < 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>बजेट चेतावनी</AlertTitle>
                  <AlertDescription>
                    तपाईंले आफ्नो 'चाहना' बजेट पार गर्नुभएको छ!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => handleNavigateMonth(-1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      अघिल्लो महिना
                  </Button>
                  <Button variant="outline" onClick={() => handleNavigateMonth(1)}>
                      अर्को महिना
                      <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
              </div>

            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <LoanTotalsSummary
                totalOutstanding={totals.totalOutstanding}
                totalEMI={totals.totalScheduledEMI}
                longestRemaining={totals.longestRemaining}
              />

              <div id="loansContainer" className="space-y-6">
                {(appData.loans || []).map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    status={loanStatuses[loan.id]}
                    onUpdate={updateLoan}
                    onDelete={() => setLoanToDelete(loan.id)}
                    currentYearBs={currentYearBs}
                    currentMonthBs={currentMonthBs}
                    onMarkAsPaid={handleMarkAsPaid}
                  />
                ))}
              </div>

              <Button
                onClick={addLoan}
                className="w-full py-6 text-lg bg-primary text-white hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-6 w-6" />
                नयाँ ऋण थप्नुहोस्
              </Button>
            </div>
          </main>
        </div>
      </div>
      <AlertDialog open={loanToDelete !== null} onOpenChange={(open) => !open && setLoanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ऋण मेटाउने पुष्टि गर्नुहोस्</AlertDialogTitle>
            <AlertDialogDescription>
              के तपाईं साँच्चै यो ऋण मेटाउन चाहनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLoanToDelete(null)}>रद्द गर्नुहोस्</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLoan} className="bg-destructive hover:bg-destructive/90">निश्चित गर्नुहोस्</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
