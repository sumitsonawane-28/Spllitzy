export type BudgetType = 'monthly' | 'trip';

export type BudgetCategory = 
  | 'Food'
  | 'Travel'
  | 'Rent'
  | 'Shopping'
  | 'Groceries'
  | 'Custom';

export interface CategoryBudget {
  category: BudgetCategory;
  limit: number;
  customName?: string;
}

export interface MemberSpendingCap {
  memberId: string;
  amount: number;
}

export interface BudgetPeriod {
  id: string;
  groupId: string;
  type: BudgetType;
  totalAmount: number;
  categoryBudgets: CategoryBudget[];
  memberSpendingCaps?: MemberSpendingCap[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetHistory extends Omit<BudgetPeriod, 'isActive' | 'endDate'> {
  endDate: string;
  totalSpent: number;
  status: 'under' | 'warning' | 'over';
}

export interface BudgetState {
  currentBudget: BudgetPeriod | null;
  history: BudgetHistory[];
  isLoading: boolean;
  error: string | null;
}
