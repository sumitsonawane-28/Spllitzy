import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Archive } from 'lucide-react';
import { useBudgetStore, getBudgetStatusColor, getBudgetStatusText } from '@/store/budgetStore';

export function BudgetOverview() {
  const { currentBudget, calculateBudgetStatus, resetBudget, archiveBudget } = useBudgetStore();
  const status = calculateBudgetStatus();
  
  if (!currentBudget) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>No Active Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No active budget set up for this group.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBudgetStatusColor(status.status)}`}>
            {getBudgetStatusText(status.status)}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={resetBudget}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={archiveBudget}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Spent: {status.usedAmount.toFixed(2)}</span>
            <span>Remaining: {status.remaining.toFixed(2)}</span>
          </div>
          <Progress value={Math.min(100, status.percentageUsed)} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {status.percentageUsed.toFixed(1)}% of {status.totalBudget.toFixed(2)} used
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <h3 className="text-sm font-medium mb-2">By Category</h3>
            <div className="space-y-2">
              {currentBudget.categories.map((category) => (
                <div key={category.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>{category.name}</span>
                    <span>{category.usedAmount} / {category.limit}</span>
                  </div>
                  <Progress 
                    value={(category.usedAmount / (category.limit || 1)) * 100} 
                    className="h-1.5 mt-1" 
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">By Member</h3>
            <div className="space-y-2">
              {currentBudget.memberCaps.map((cap) => (
                <div key={cap.memberId} className="text-sm">
                  <div className="flex justify-between">
                    <span>Member {cap.memberId.slice(0, 4)}</span>
                    <span>{cap.usedAmount} / {cap.limit}</span>
                  </div>
                  <Progress 
                    value={(cap.usedAmount / (cap.limit || 1)) * 100} 
                    className="h-1.5 mt-1" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
