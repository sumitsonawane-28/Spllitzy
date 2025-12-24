import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type BudgetHistory = {
  id: string;
  startDate: string;
  endDate?: string;
  totalBudget: number;
  usedAmount: number;
  periodType: 'monthly' | 'trip';
  status: 'active' | 'completed';
};

export function BudgetHistory({ history }: { history: BudgetHistory[] }) {
  if (history.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Budget History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No budget history available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Budget History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => {
              const percentage = getUsagePercentage(item.usedAmount, item.totalBudget);
              const periodLabel = item.periodType === 'monthly'
                ? format(new Date(item.startDate), 'MMM yyyy')
                : `Trip (${format(new Date(item.startDate), 'MMM d')} - ${item.endDate ? format(new Date(item.endDate), 'MMM d, yyyy') : 'Ongoing'})`;
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {periodLabel}
                  </TableCell>
                  <TableCell>
                    <div className="font-mono">
                      ₹{item.totalBudget.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>₹{item.usedAmount.toLocaleString()}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getUsageColor(percentage)}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
