import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BS_MONTHS, BS_YEAR_START, BS_YEAR_END } from '@/lib/constants';

type MonthNavigatorProps = {
  currentYear: number;
  currentMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onNavigate: (direction: 1 | -1) => void;
};

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentYear,
  currentMonth,
  onYearChange,
  onMonthChange,
  onNavigate,
}) => {
  const years = Array.from(
    { length: BS_YEAR_END - BS_YEAR_START + 1 },
    (_, i) => BS_YEAR_START + i
  );

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 p-3 bg-muted rounded-xl shadow-inner">
      <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)} className="text-primary hover:bg-primary/10">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Select
        value={String(currentYear)}
        onValueChange={(val) => onYearChange(Number(val))}
      >
        <SelectTrigger className="w-[100px] sm:w-[120px] bg-background">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(currentMonth)}
        onValueChange={(val) => onMonthChange(Number(val))}
      >
        <SelectTrigger className="w-[120px] sm:w-[150px] bg-background">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {BS_MONTHS.map((month, index) => (
            <SelectItem key={index + 1} value={String(index + 1)}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={() => onNavigate(1)} className="text-primary hover:bg-primary/10">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
