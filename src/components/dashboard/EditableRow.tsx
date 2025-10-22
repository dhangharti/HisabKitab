import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Income, Expense } from '@/lib/types';

type EditableRowProps = {
  item: Income | Expense;
  onUpdate: (item: Income | Expense) => void;
  onDelete: () => void;
};

export const EditableRow: React.FC<EditableRowProps> = ({ item, onUpdate, onDelete }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...item, name: e.target.value });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...item, amount: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={item.name}
        placeholder="शिर्षक"
        onChange={handleNameChange}
        className="flex-grow"
      />
      <Input
        type="number"
        value={item.amount}
        placeholder="रकम"
        onChange={handleAmountChange}
        className="w-28 text-right"
        step="100"
      />
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
