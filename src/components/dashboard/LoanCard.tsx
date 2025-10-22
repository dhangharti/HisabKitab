import * as React from 'react';
import { Loan, LoanStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, AlertCircle, CalendarClock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BS_MONTHS, BS_YEAR_START, BS_YEAR_END } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getPaymentDate } from '@/lib/loan-calculations';

type LoanCardProps = {
  loan: Loan;
  status: LoanStatus;
  onUpdate: (loanId: string, field: keyof Loan, value: string | number) => void;
  onDelete: (loanId: string) => void;
  currentYearBs: number;
  currentMonthBs: number;
  onMarkAsPaid: (loanId: string, month: number) => void;
};

export const LoanCard: React.FC<LoanCardProps> = ({ loan, status, onUpdate, onDelete, currentYearBs, currentMonthBs, onMarkAsPaid }) => {
  const isPaidOff = status.isPaidOff;
  
  const handleUpdate = (field: keyof Loan, value: string | number) => {
    onUpdate(loan.id, field, value);
  };
  
  const years = Array.from({ length: BS_YEAR_END - BS_YEAR_START + 1 }, (_, i) => BS_YEAR_START + i);

  const nextPayment = status.nextPayment;
  const overdueCount = status.overduePayments.length;

  const renderPaymentStatus = () => {
    if (!nextPayment && !overdueCount) {
        return null;
    }

    const targetDate = new Date(currentYearBs, currentMonthBs - 1, 15); // Use mid-month for comparison
    
    if (overdueCount > 0) {
        return (
             <div className='p-4 rounded-lg bg-red-100 border border-red-300 text-red-800'>
                <div className="flex items-center gap-2 font-bold mb-2">
                    <AlertCircle className="h-5 w-5"/>
                    <span>{overdueCount} भुक्तानी बाँकी छ</span>
                </div>
                <ul className='text-sm space-y-1 pl-2'>
                    {status.overduePayments.map(p => (
                         <li key={p.month} className="flex justify-between items-center">
                            <span>{BS_MONTHS[p.dueDate.getMonth()]} {p.dueDate.getFullYear()}: रू {p.payment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                            <Button size="sm" onClick={() => onMarkAsPaid(loan.id, p.month)}>भुक्तानी गर्नुहोस्</Button>
                         </li>
                    ))}
                </ul>
            </div>
        )
    }

    if (nextPayment) {
        if (nextPayment.status === 'paid') {
             return (
                <div className='flex items-center gap-2 p-3 rounded-lg bg-green-100 border border-green-300 text-green-800 font-medium'>
                    <CheckCircle className="h-5 w-5"/>
                    <span>{BS_MONTHS[nextPayment.dueDate.getMonth()]} को भुक्तानी गरियो!</span>
                </div>
            )
        }

        const isDueThisMonth = nextPayment.dueDate.getFullYear() === currentYearBs && nextPayment.dueDate.getMonth() === currentMonthBs -1;
        
        return (
            <div className={cn('p-4 rounded-lg border', 
                isDueThisMonth ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-gray-50 border-gray-200'
            )}>
                 <div className="flex items-center gap-2 font-bold mb-2">
                    <CalendarClock className="h-5 w-5"/>
                    <span>अर्को भुक्तानी</span>
                </div>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium">मिति:</span>
                        <span className="font-bold">{BS_MONTHS[nextPayment.dueDate.getMonth()]} {nextPayment.dueDate.getFullYear()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-medium">रकम:</span>
                        <span className="font-bold">रू {nextPayment.payment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                    </div>
                 </div>
                 {isDueThisMonth && (
                    <Button className="w-full mt-3" size="sm" onClick={() => onMarkAsPaid(loan.id, nextPayment.month)}>
                        भुक्तानी भयो चिन्ह लगाउनुहोस्
                    </Button>
                 )}
            </div>
        )
    }
    
    return null;
  }

  return (
    <Card className={cn("transition-all duration-300", isPaidOff ? 'bg-green-50 border-green-200' : 'bg-card')}>
      <CardHeader className="flex-row justify-between items-start">
        <div>
          <Input 
            value={loan.name}
            onChange={(e) => handleUpdate('name', e.target.value)}
            className="text-xl font-semibold border-0 border-b-2 border-dashed rounded-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:border-primary"
          />
          <Badge className={cn("mt-2", isPaidOff ? 'bg-primary-green' : 'bg-primary')}>
            {isPaidOff ? 'ऋण चुक्ता भयो!' : 'सक्रिय'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDelete(loan.id)} className="text-destructive flex-shrink-0">
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Status */}
        {!isPaidOff && renderPaymentStatus()}

        {/* Loan Configuration */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3 text-lg">ऋण विवरण</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor={`principal-${loan.id}`}>मूलधन (Principal - रू)</Label>
              <Input id={`principal-${loan.id}`} type="number" value={loan.principal} onChange={(e) => handleUpdate('principal', Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`rate-${loan.id}`}>ब्याज दर (Rate - %)</Label>
                <Input id={`rate-${loan.id}`} type="number" step="0.1" value={loan.rate} onChange={(e) => handleUpdate('rate', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor={`years-${loan.id}`}>अवधि (Years)</Label>
                <Input id={`years-${loan.id}`} type="number" value={loan.years} onChange={(e) => handleUpdate('years', Number(e.target.value))} />
              </div>
            </div>
            <div className="pt-2">
              <Label>ऋण सुरु मिति</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={String(loan.startDateYear)} onValueChange={(val) => handleUpdate('startDateYear', Number(val))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={String(loan.startDateMonth)} onValueChange={(val) => handleUpdate('startDateMonth', Number(val))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{BS_MONTHS.map((m, i) => <SelectItem key={i} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
           <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between font-bold text-blue-800">
            <span>निश्चित मासिक किस्ता (EMI):</span>
            <span>रू {status.emi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 rounded-b-lg bg-red-100 border-t-2 border-red-300 text-center flex-col">
         <p className="text-sm font-medium text-red-800">कुल बाँकी रकम:</p>
         <p className="text-2xl font-extrabold text-red-700 mt-1">रू {status.currentOutstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </CardFooter>
    </Card>
  );
};
