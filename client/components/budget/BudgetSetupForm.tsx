import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';
import { useBudgetStore, initializeBudget } from '@/store/budgetStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useToast } from '@/hooks/use-toast';

export function BudgetSetupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentBudget, setCurrentBudget, updateBudget } = useBudgetStore();
  
  const [periodType, setPeriodType] = useState<'monthly' | 'trip'>('monthly');
  const [totalBudget, setTotalBudget] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; limit: string }>>([]);
  const [newCategory, setNewCategory] = useState('');
  const [memberCaps, setMemberCaps] = useState<Array<{ memberId: string; name: string; limit: string }>>([]);
  
  // Initialize form with existing budget if available
  useEffect(() => {
    if (currentBudget) {
      setPeriodType(currentBudget.periodType);
      setTotalBudget(currentBudget.totalBudget.toString());
      setCategories(
        currentBudget.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          limit: cat.limit.toString(),
        }))
      );
      // In a real app, you would fetch member names here
      setMemberCaps(
        currentBudget.memberCaps.map(cap => ({
          memberId: cap.memberId,
          name: `Member ${cap.memberId.slice(0, 4)}`,
          limit: cap.limit.toString(),
        }))
      );
    } else if (groupId) {
      // Initialize with default values for new budget
      const defaultBudget = initializeBudget(groupId);
      setPeriodType('monthly');
      setTotalBudget('0');
      setCategories(
        defaultBudget.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          limit: cat.limit.toString(),
        }))
      );
    }
  }, [currentBudget, groupId]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    setCategories([...categories, { 
      id: Date.now().toString(), 
      name: newCategory.trim(), 
      limit: '0' 
    }]);
    setNewCategory('');
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleUpdateCategory = (id: string, field: 'name' | 'limit', value: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const handleAddMemberCap = (memberId: string, name: string) => {
    if (memberCaps.some(cap => cap.memberId === memberId)) return;
    
    setMemberCaps([...memberCaps, { 
      memberId, 
      name,
      limit: '0' 
    }]);
  };

  const handleRemoveMemberCap = (memberId: string) => {
    setMemberCaps(memberCaps.filter(cap => cap.memberId !== memberId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId) {
      toast({
        title: 'Error',
        description: 'Group ID is missing',
        variant: 'destructive',
      });
      return;
    }

    const isUpdate = !!currentBudget;
    const budgetData = {
      id: currentBudget?.id || `budget_${Date.now()}`,
      groupId,
      totalBudget: parseFloat(totalBudget) || 0,
      usedAmount: currentBudget?.usedAmount || 0,
      periodType,
      startDate: currentBudget?.startDate || new Date().toISOString(),
      endDate: periodType === 'monthly' 
        ? new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        : undefined,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        limit: parseFloat(cat.limit) || 0,
        usedAmount: 0,
      })),
      memberCaps: memberCaps.map(cap => ({
        memberId: cap.memberId,
        limit: parseFloat(cap.limit) || 0,
        usedAmount: 0,
      })),
      isActive: true,
    };

    // Log activity
    const { addActivity } = useExpenseStore.getState();
    const activityType = isUpdate ? 'budget_updated' : 'budget_created';
    const activityDescription = isUpdate 
      ? 'Budget was updated' 
      : `Budget of ${budgetData.totalBudget} for ${budgetData.periodType} period was created`;

    addActivity({
      groupId,
      type: activityType,
      description: activityDescription,
      amount: budgetData.totalBudget,
      budgetData: {
        totalBudget: budgetData.totalBudget,
        periodType: budgetData.periodType,
        categories: budgetData.categories.map(cat => ({
          name: cat.name,
          limit: cat.limit
        }))
      }
    });

    if (isUpdate) {
      updateBudget(budgetData);
      toast({
        title: 'Success',
        description: 'Budget updated successfully',
      });
    } else {
      setCurrentBudget(budgetData);
      toast({
        title: 'Success',
        description: 'Budget created successfully',
      });
    }

    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentBudget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="periodType">Budget Period</Label>
                <select
                  id="periodType"
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'trip')}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="trip">Trip</option>
                </select>
              </div>

              <div>
                <Label htmlFor="totalBudget">Total Budget</Label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <Input
                    type="number"
                    id="totalBudget"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Budget Categories</Label>
              <div className="mt-2 space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={category.name}
                      onChange={(e) => handleUpdateCategory(category.id, 'name', e.target.value)}
                      className="flex-1"
                      required
                    />
                    <div className="relative w-32">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <Input
                        type="number"
                        value={category.limit}
                        onChange={(e) => handleUpdateCategory(category.id, 'limit', e.target.value)}
                        className="pl-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(category.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="New category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCategory}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Member Spending Caps (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Set individual spending limits for group members
            </p>
            <div className="space-y-2">
              {memberCaps.map((cap) => (
                <div key={cap.memberId} className="flex items-center space-x-2">
                  <div className="flex-1 font-medium">{cap.name}</div>
                  <div className="relative w-40">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <Input
                      type="number"
                      value={cap.limit}
                      onChange={(e) => {
                        const newCaps = memberCaps.map(c => 
                          c.memberId === cap.memberId 
                            ? { ...c, limit: e.target.value } 
                            : c
                        );
                        setMemberCaps(newCaps);
                      }}
                      className="pl-8"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMemberCap(cap.memberId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* In a real app, you would have a list of members to select from */}
              <div className="flex items-center space-x-2">
                <select
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  defaultValue=""
                  onChange={(e) => {
                    const memberId = e.target.value;
                    if (memberId) {
                      handleAddMemberCap(memberId, `Member ${memberId.slice(0, 4)}`);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Add member cap...</option>
                  {/* In a real app, map through group members */}
                  <option value="mem_1">Member 1</option>
                  <option value="mem_2">Member 2</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => groupId && navigate(`/group/${groupId}`)}
            >
              ← Back to Group
            </Button>
            <div className="space-x-4">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button type="submit">
                {currentBudget ? 'Update Budget' : 'Create Budget'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
