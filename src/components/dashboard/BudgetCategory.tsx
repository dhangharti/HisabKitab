
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EditableRow } from './EditableRow';
import type { Income, Expense } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

type BudgetCategoryProps = {
  title: string;
  rule: string;
  budget: number;
  spent: number;
  remaining: number;
  colorClass: 'primary-red' | 'primary-green' | 'primary-blue';
  items: (Income | Expense)[];
  onAddItem: () => void;
  onUpdateItem: (index: number, item: Income | Expense) => void;
  onDeleteItem: (index: number) => void;
  buttonText: string;
  loanPrincipal?: number;
};

const colorStyles = {
    'primary-red': {
        card: 'border-destructive',
        cardHeader: 'text-primary-red',
        progress: '[&>*]:bg-primary-red',
        button: 'border-primary-red text-primary-red hover:bg-primary-red/10',
    },
    'primary-green': {
        card: 'border-primary-green/50',
        cardHeader: 'text-primary-green',
        progress: '[&>*]:bg-primary-green',
        button: 'border-primary-green text-primary-green hover:bg-primary-green/10',
    },
    'primary-blue': {
        card: 'border-primary-blue/50',
        cardHeader: 'text-primary-blue',
        progress: '[&>*]:bg-primary-blue',
        button: 'border-primary-blue text-primary-blue hover:bg-primary-blue/10',
    }
};

export const BudgetCategory: React.FC<BudgetCategoryProps> = ({
  title,
  rule,
  budget,
  spent,
  remaining,
  colorClass,
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  buttonText,
  loanPrincipal,
}) => {
  const progressValue = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = remaining < 0;

  const styles = colorStyles[colorClass] || colorStyles['primary-blue'];

  return (
    <Card className={cn("border-2", isOverBudget ? styles.card : `border-${colorClass}/50`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
            <CardTitle className={cn(styles.cardHeader)}>{title} - {rule}</CardTitle>
            {isOverBudget && <AlertTriangle className="h-6 w-6 text-destructive" />}
        </div>
        <div className="text-sm text-muted-foreground">
          बजेट: रू {budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>खर्च भयो: रू {spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className={cn(isOverBudget ? "text-destructive" : "text-muted-foreground")}>
                    बाँकी: रू {remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
            </div>
          <Progress value={progressValue} className={cn(styles.progress)} />
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t pt-4">
          {loanPrincipal !== undefined && loanPrincipal > 0 && (
             <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <span className="text-sm font-medium text-gray-600">ऋण मूलधन भुक्तानी</span>
                <span className="text-sm font-bold text-gray-800">
                    रू {loanPrincipal.toLocaleString('en-IN')}
                </span>
            </div>
          )}
          {items.map((item, index) => (
            <EditableRow
              key={item.id}
              item={item}
              onUpdate={(updatedItem) => onUpdateItem(index, updatedItem)}
              onDelete={() => onDeleteItem(index)}
            />
          ))}
        </div>

        <Button
          onClick={onAddItem}
          variant="outline"
          className={cn('w-full mt-2', styles.button)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
