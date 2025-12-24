import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GroupBudget, BudgetCategory, BudgetHistory, MemberSpendingCap } from '../../shared/api';

interface BudgetStore {
  // Current budget for the group
  currentBudget: GroupBudget | null;
  budgetHistory: BudgetHistory[];
  
  // Actions
  setCurrentBudget: (budget: GroupBudget) => void;
  updateBudget: (updates: Partial<GroupBudget>) => void;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'usedAmount'>) => void;
  updateCategory: (categoryId: string, updates: Partial<BudgetCategory>) => void;
  removeCategory: (categoryId: string) => void;
  addMemberCap: (cap: Omit<MemberSpendingCap, 'usedAmount'>) => void;
  updateMemberCap: (memberId: string, updates: Partial<MemberSpendingCap>) => void;
  removeMemberCap: (memberId: string) => void;
  resetBudget: () => void;
  archiveBudget: () => void;
  calculateBudgetStatus: () => {
    totalBudget: number;
    usedAmount: number;
    remaining: number;
    percentageUsed: number;
    status: 'under' | 'warning' | 'over';
  };
}

const DEFAULT_CATEGORIES = [
  { name: 'Food', limit: 0 },
  { name: 'Travel', limit: 0 },
  { name: 'Rent', limit: 0 },
  { name: 'Shopping', limit: 0 },
  { name: 'Groceries', limit: 0 },
];

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentBudget: null,
  budgetHistory: [],

  setCurrentBudget: (budget) => set({ currentBudget: budget }),

  updateBudget: (updates) =>
    set((state) => ({
      currentBudget: state.currentBudget ? { ...state.currentBudget, ...updates } : null,
    })),

  addCategory: (category) =>
    set((state) => {
      if (!state.currentBudget) return state;
      
      const newCategory: BudgetCategory = {
        ...category,
        id: uuidv4(),
        usedAmount: 0,
      };

      return {
        currentBudget: {
          ...state.currentBudget,
          categories: [...state.currentBudget.categories, newCategory],
        },
      };
    }),

  updateCategory: (categoryId, updates) =>
    set((state) => {
      if (!state.currentBudget) return state;

      return {
        currentBudget: {
          ...state.currentBudget,
          categories: state.currentBudget.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, ...updates } : cat
          ),
        },
      };
    }),

  removeCategory: (categoryId) =>
    set((state) => {
      if (!state.currentBudget) return state;

      return {
        currentBudget: {
          ...state.currentBudget,
          categories: state.currentBudget.categories.filter(
            (cat) => cat.id !== categoryId
          ),
        },
      };
    }),

  addMemberCap: (cap) =>
    set((state) => {
      if (!state.currentBudget) return state;

      const newCap: MemberSpendingCap = {
        ...cap,
        usedAmount: 0,
      };

      return {
        currentBudget: {
          ...state.currentBudget,
          memberCaps: [...state.currentBudget.memberCaps, newCap],
        },
      };
    }),

  updateMemberCap: (memberId, updates) =>
    set((state) => {
      if (!state.currentBudget) return state;

      return {
        currentBudget: {
          ...state.currentBudget,
          memberCaps: state.currentBudget.memberCaps.map((cap) =>
            cap.memberId === memberId ? { ...cap, ...updates } : cap
          ),
        },
      };
    }),

  removeMemberCap: (memberId) =>
    set((state) => {
      if (!state.currentBudget) return state;

      return {
        currentBudget: {
          ...state.currentBudget,
          memberCaps: state.currentBudget.memberCaps.filter(
            (cap) => cap.memberId !== memberId
          ),
        },
      };
    }),

  resetBudget: () =>
    set((state) => {
      if (!state.currentBudget) return state;

      // Archive current budget
      const now = new Date().toISOString();
      const historyEntry: BudgetHistory = {
        id: uuidv4(),
        startDate: state.currentBudget.startDate,
        endDate: now,
        totalBudget: state.currentBudget.totalBudget,
        usedAmount: state.currentBudget.usedAmount,
        periodType: state.currentBudget.periodType,
        status: 'completed',
      };

      // Create new empty budget
      const newBudget: GroupBudget = {
        id: uuidv4(),
        groupId: state.currentBudget.groupId,
        totalBudget: state.currentBudget.totalBudget, // Keep same total budget by default
        usedAmount: 0,
        periodType: state.currentBudget.periodType,
        startDate: now,
        categories: state.currentBudget.categories.map((cat) => ({
          ...cat,
          usedAmount: 0,
        })),
        memberCaps: state.currentBudget.memberCaps.map((cap) => ({
          ...cap,
          usedAmount: 0,
        })),
        isActive: true,
      };

      return {
        currentBudget: newBudget,
        budgetHistory: [historyEntry, ...state.budgetHistory],
      };
    }),

  archiveBudget: () =>
    set((state) => {
      if (!state.currentBudget) return state;

      const now = new Date().toISOString();
      const historyEntry: BudgetHistory = {
        id: uuidv4(),
        startDate: state.currentBudget.startDate,
        endDate: now,
        totalBudget: state.currentBudget.totalBudget,
        usedAmount: state.currentBudget.usedAmount,
        periodType: state.currentBudget.periodType,
        status: 'completed',
      };

      return {
        currentBudget: null,
        budgetHistory: [historyEntry, ...state.budgetHistory],
      };
    }),

  calculateBudgetStatus: () => {
    const { currentBudget } = get();
    if (!currentBudget) {
      return {
        totalBudget: 0,
        usedAmount: 0,
        remaining: 0,
        percentageUsed: 0,
        status: 'under' as const,
      };
    }

    const { totalBudget, usedAmount } = currentBudget;
    const remaining = Math.max(0, totalBudget - usedAmount);
    const percentageUsed = totalBudget > 0 ? (usedAmount / totalBudget) * 100 : 0;

    let status: 'under' | 'warning' | 'over' = 'under';
    if (percentageUsed >= 100) {
      status = 'over';
    } else if (percentageUsed >= 70) {
      status = 'warning';
    }

    return {
      totalBudget,
      usedAmount,
      remaining,
      percentageUsed,
      status,
    };
  },
}));

export const initializeBudget = (groupId: string): GroupBudget => {
  const now = new Date().toISOString();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  return {
    id: uuidv4(),
    groupId,
    totalBudget: 0,
    usedAmount: 0,
    periodType: 'monthly',
    startDate: now,
    endDate: endDate.toISOString(),
    categories: DEFAULT_CATEGORIES.map((cat) => ({
      id: uuidv4(),
      name: cat.name,
      limit: cat.limit,
      usedAmount: 0,
    })),
    memberCaps: [],
    isActive: true,
  };
};

export const getBudgetStatusColor = (status: 'under' | 'warning' | 'over') => {
  switch (status) {
    case 'under':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'over':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getBudgetStatusText = (status: 'under' | 'warning' | 'over') => {
  switch (status) {
    case 'under':
      return 'On Track';
    case 'warning':
      return 'Approaching Limit';
    case 'over':
      return 'Over Budget';
    default:
      return 'Unknown';
  }
};
