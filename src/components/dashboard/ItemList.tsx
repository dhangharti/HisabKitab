import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EditableRow } from './EditableRow';
import type { Income, Expense } from '@/lib/types';
import { cn } from '@/lib/utils';

type ItemListProps = {
  title: string;
  items: (Income | Expense)[];
  total: number;
  onAddItem: () => void;
  onUpdateItem: (index: number, item: Income | Expense) => void;
  onDeleteItem: (index: number) => void;
  colorClass: string;
  borderColorClass: string;
  buttonText?: string;
};

export const ItemList: React.FC<ItemListProps> = ({
  title,
  items,
  total,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  colorClass,
  borderColorClass,
  buttonText,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className={cn('text-lg font-medium', colorClass)}>{title}</h3>
        <span className={cn('text-xl font-bold', colorClass)}>
          रू {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
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
        className={cn('w-full mt-2', colorClass, borderColorClass, `hover:${colorClass}`)}
      >
        <Plus className="h-4 w-4 mr-2" />
        {buttonText || title.split(' ')[0]} थप्नुहोस्
      </Button>
    </div>
  );
};
