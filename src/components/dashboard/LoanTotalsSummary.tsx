import * as React from 'react';
import { Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LoanTotalsSummaryProps = {
  totalOutstanding: number;
  totalEMI: number;
  longestRemaining: number;
};

export const LoanTotalsSummary: React.FC<LoanTotalsSummaryProps> = ({
  totalOutstanding,
  totalEMI,
  longestRemaining,
}) => {
  return (
    <Card className="bg-gray-800 text-white border-yellow-400 border-2 shadow-xl sticky top-4 z-10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Landmark className="h-6 w-6 text-yellow-400" />
          <span>कुल ऋण सारांश</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between items-center border-b border-gray-700 pb-1">
          <span className="font-medium text-gray-300">कुल बाँकी रकम:</span>
          <span className="text-lg font-bold text-red-400">
            रू {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-1">
          <span className="font-medium text-gray-300">कुल मासिक किस्ता:</span>
          <span className="text-lg font-bold text-green-400">
            रू {totalEMI.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">बाँकी किस्ता (अधिकतम):</span>
          <span className="text-lg font-bold text-yellow-400">
            {longestRemaining}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
