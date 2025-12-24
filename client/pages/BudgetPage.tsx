import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { BudgetSetupForm } from '@/components/budget/BudgetSetupForm';
import { BudgetHistory } from '@/components/budget/BudgetHistory';
import { useBudgetStore } from '@/store/budgetStore';

export default function BudgetPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentBudget, budgetHistory, setCurrentBudget } = useBudgetStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // In a real app, you would fetch the budget data here
  useEffect(() => {
    if (groupId) {
      // Simulate loading budget data
      const loadBudget = async () => {
        // In a real app, you would fetch the budget from your API
        // const budget = await api.getBudget(groupId);
        // setCurrentBudget(budget);
      };
      
      loadBudget();
    }
  }, [groupId, setCurrentBudget]);

  if (isEditing) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          className="mb-4"
        >
          ← Back to Budget
        </Button>
        <BudgetSetupForm onSuccess={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget Management</h1>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/group/${groupId}`)}
          >
            ← Back to Group
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {currentBudget ? 'Edit Budget' : 'Create Budget'}
          </Button>
        </div>
      </div>

      {currentBudget ? (
        <>
          <BudgetOverview />
          {budgetHistory.length > 0 && <BudgetHistory history={budgetHistory} />}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Budget Set Up</h2>
          <p className="text-muted-foreground mb-6">
            Create a budget to track your group's spending and stay on track with your financial goals.
          </p>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Budget
          </Button>
        </div>
      )}
    </div>
  );
}
