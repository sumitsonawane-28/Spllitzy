import { create } from 'zustand';

export interface Member {
  id: string;
  name: string;
  mobile: string;
  upiId: string;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  paidBy: string;
  splits: {
    [memberId: string]: number;
  };
  date: string;
}

export interface Adjustment {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  description: string;
  date: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  currency: string;
  members: Member[];
  expenses: Expense[];
  adjustments: Adjustment[];
  createdAt: string;
}

export interface Activity {
  id: string;
  groupId: string;
  type: 'expense' | 'adjustment' | 'settlement' | 'budget_created' | 'budget_updated';
  description: string;
  amount?: number;
  date: string;
  budgetData?: {
    totalBudget: number;
    periodType: string;
    categories: { name: string; limit: number }[];
  };
}

export interface User {
  id: string;
  phone: string;
  name: string;
}

interface ExpenseStore {
  user: User | null;
  groups: Group[];
  activities: Activity[];
  
  // Auth actions
  setUser: (user: User) => void;
  logout: () => void;
  
  // Group actions
  createGroup: (group: Omit<Group, 'id' | 'expenses' | 'adjustments' | 'createdAt'>) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;
  getGroup: (groupId: string) => Group | undefined;
  
  // Member actions
  addMember: (groupId: string, member: Member) => void;
  removeMember: (groupId: string, memberId: string) => void;
  
  // Expense actions
  addExpense: (groupId: string, expense: Omit<Expense, 'id' | 'date'>) => void;
  updateExpense: (groupId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (groupId: string, expenseId: string) => void;
  
  // Adjustment actions
  addAdjustment: (groupId: string, adjustment: Omit<Adjustment, 'id' | 'date'>) => void;
  deleteAdjustment: (groupId: string, adjustmentId: string) => void;
  
  // Balance calculations
  getBalances: (groupId: string) => { [key: string]: number };
  getActivityLog: (groupId: string) => Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  user: null,
  groups: [],
  activities: [],
  
  setUser: (user: User) => set({ user }),
  
  logout: () => set({ user: null, groups: [], activities: [] }),
  
  createGroup: (group) => set((state) => ({
    groups: [
      ...state.groups,
      {
        ...group,
        id: `group_${Date.now()}`,
        expenses: [],
        adjustments: [],
        createdAt: new Date().toISOString(),
      },
    ],
  })),
  
  updateGroup: (groupId, updates) => set((state) => ({
    groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
  })),
  
  deleteGroup: (groupId) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== groupId),
  })),
  
  getGroup: (groupId) => {
    const state = get();
    return state.groups.find((g) => g.id === groupId);
  },
  
  addMember: (groupId, member) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId ? { ...g, members: [...g.members, member] } : g
    ),
  })),
  
  removeMember: (groupId, memberId) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId
        ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
        : g
    ),
  })),
  
  addExpense: (groupId, expense) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            expenses: [
              ...g.expenses,
              {
                ...expense,
                id: `expense_${Date.now()}`,
                date: new Date().toISOString(),
              },
            ],
          }
        : g
    ),
  })),
  
  updateExpense: (groupId, expenseId, updates) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            expenses: g.expenses.map((e) =>
              e.id === expenseId ? { ...e, ...updates } : e
            ),
          }
        : g
    ),
  })),
  
  deleteExpense: (groupId, expenseId) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            expenses: g.expenses.filter((e) => e.id !== expenseId),
          }
        : g
    ),
  })),
  
  addAdjustment: (groupId, adjustment) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            adjustments: [
              ...g.adjustments,
              {
                ...adjustment,
                id: `adjustment_${Date.now()}`,
                date: new Date().toISOString(),
              },
            ],
          }
        : g
    ),
  })),
  
  deleteAdjustment: (groupId, adjustmentId) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            adjustments: g.adjustments.filter((a) => a.id !== adjustmentId),
          }
        : g
    ),
  })),
  
  getBalances: (groupId) => {
    const state = get();
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return {};
    
    const balances: { [key: string]: number } = {};
    group.members.forEach((m) => {
      balances[m.id] = 0;
    });
    
    // Calculate expenses
    group.expenses.forEach((expense) => {
      balances[expense.paidBy] += expense.amount;
      
      Object.entries(expense.splits).forEach(([memberId, amount]) => {
        balances[memberId] -= amount as number;
      });
    });
    
    // Apply adjustments
    group.adjustments.forEach((adj) => {
      balances[adj.from] -= adj.amount;
      balances[adj.to] += adj.amount;
    });
    
    return balances;
  },
  
  addActivity: (activity) => set((state) => ({
    activities: [
      ...state.activities,
      {
        ...activity,
        id: `activity_${Date.now()}`,
        date: new Date().toISOString(),
      },
    ],
  })),
  
  getActivityLog: (groupId) => {
    const state = get();
    return state.activities.filter((a) => a.groupId === groupId);
  },
}));
