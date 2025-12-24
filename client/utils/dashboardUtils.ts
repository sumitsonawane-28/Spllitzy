import { Group, Expense, Activity } from "@/store/expenseStore";

export interface DashboardSummary {
  totalSpentByUser: number;
  totalSpentByGroup: number;
  userBalance: number;
  currency: string;
  groupsCount: number;
}

export interface GroupSummary {
  id: string;
  name: string;
  totalExpenses: number;
  memberCount: number;
  userBalance: number;
  currency: string;
  recentActivity?: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TopSpender {
  memberId: string;
  name: string;
  amount: number;
}

export interface MonthlyTrend {
  week: string;
  amount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#4F46E5',
  Travel: '#10B981',
  Rent: '#F59E0B',
  Shopping: '#EF4444',
  Entertainment: '#8B5CF6',
  Utilities: '#06B6D4',
  Other: '#6B7280',
};

export function calculateDashboardSummary(
  groups: Group[],
  userId: string
): DashboardSummary {
  let totalSpentByUser = 0;
  let totalSpentByGroup = 0;
  let userBalance = 0;
  let currency = '₹'; // Default currency

  groups.forEach((group) => {
    currency = group.currency || currency;
    
    // Calculate total spent by user in this group
    const userExpenses = group.expenses.filter(
      (expense) => expense.paidBy === userId
    );
    totalSpentByUser += userExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate total spent by group
    totalSpentByGroup += group.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate user's balance in this group
    const balances = calculateBalances(group);
    userBalance += balances[userId] || 0;
  });

  return {
    totalSpentByUser,
    totalSpentByGroup,
    userBalance,
    currency,
    groupsCount: groups.length,
  };
}

export function getGroupSummaries(
  groups: Group[],
  userId: string
): GroupSummary[] {
  return groups.map((group) => {
    const totalExpenses = group.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const balances = calculateBalances(group);
    const userBalance = balances[userId] || 0;

    // Get most recent activity
    const activities = getGroupActivity(group);
    const recentActivity = activities[0]?.description || 'No recent activity';

    return {
      id: group.id,
      name: group.name,
      totalExpenses,
      memberCount: group.members.length,
      userBalance,
      currency: group.currency || '₹',
      recentActivity,
    };
  });
}

export function getCategorySpending(
  groups: Group[],
  groupId?: string
): CategorySpending[] {
  const categoryMap: Record<string, number> = {};
  let total = 0;

  const processExpenses = (expenses: Expense[]) => {
    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
      total += expense.amount;
    });
  };

  if (groupId) {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      processExpenses(group.expenses);
    }
  } else {
    groups.forEach((group) => {
      processExpenses(group.expenses);
    });
  }

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTopSpenders(groups: Group[], groupId?: string): TopSpender[] {
  const spenderMap: Record<string, { name: string; amount: number }> = {};

  const processExpenses = (expenses: Expense[]) => {
    expenses.forEach((expense) => {
      const memberId = expense.paidBy;
      if (!spenderMap[memberId]) {
        const member = groups
          .flatMap((g) => g.members)
          .find((m) => m.id === memberId);
        spenderMap[memberId] = {
          name: member?.name || 'Unknown',
          amount: 0,
        };
      }
      spenderMap[memberId].amount += expense.amount;
    });
  };

  if (groupId) {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      processExpenses(group.expenses);
    }
  } else {
    groups.forEach((group) => {
      processExpenses(group.expenses);
    });
  }

  return Object.entries(spenderMap)
    .map(([memberId, data]) => ({
      memberId,
      ...data,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5 spenders
}

export function getMonthlyTrends(groups: Group[]): MonthlyTrend[] {
  // Group expenses by week
  const weeklyExpenses: Record<string, number> = {};
  const now = new Date();
  
  // Get last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weeklyExpenses[weekKey] = 0;
    
    // Sum expenses for this week
    groups.forEach((group) => {
      group.expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= weekStart && expenseDate <= weekEnd) {
          weeklyExpenses[weekKey] += expense.amount;
        }
      });
    });
  }
  
  return Object.entries(weeklyExpenses).map(([week, amount]) => ({
    week,
    amount,
  }));
}

export function getQuickInsights(groups: Group[], userId: string): string[] {
  const insights: string[] = [];
  
  // Calculate total spent by category
  const categorySpending = getCategorySpending(groups);
  if (categorySpending.length > 0) {
    const topCategory = categorySpending[0];
    insights.push(`You spent most on ${topCategory.category} this month (${topCategory.amount.toFixed(2)})`);
  }
  
  // Calculate pending settlements
  let pendingSettlements = 0;
  groups.forEach((group) => {
    const balances = calculateBalances(group);
    if (balances[userId] > 0) {
      pendingSettlements++;
    }
  });
  
  if (pendingSettlements > 0) {
    insights.push(`You have ${pendingSettlements} pending settlement${pendingSettlements > 1 ? 's' : ''} to receive`);
  } else {
    insights.push("You're all settled up!");
  }
  
  // Add more insights as needed
  const totalSpent = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);
  if (totalSpent > 0) {
    insights.push(`Total spent this month: ₹${totalSpent.toFixed(2)}`);
  }
  
  return insights;
}

// Helper function to calculate balances for a group
function calculateBalances(group: Group): Record<string, number> {
  const balances: Record<string, number> = {};
  
  // Initialize balances
  group.members.forEach((member) => {
    balances[member.id] = 0;
  });
  
  // Process expenses
  group.expenses.forEach((expense) => {
    // Add to payer's balance
    if (!balances[expense.paidBy]) {
      balances[expense.paidBy] = 0;
    }
    balances[expense.paidBy] += expense.amount;
    
    // Subtract from each person's share
    Object.entries(expense.splits).forEach(([memberId, amount]) => {
      if (!balances[memberId]) {
        balances[memberId] = 0;
      }
      balances[memberId] -= amount;
    });
  });
  
  // Process adjustments
  group.adjustments.forEach((adjustment) => {
    if (!balances[adjustment.from]) balances[adjustment.from] = 0;
    if (!balances[adjustment.to]) balances[adjustment.to] = 0;
    
    balances[adjustment.from] -= adjustment.amount;
    balances[adjustment.to] += adjustment.amount;
  });
  
  return balances;
}

// Helper function to get group activity
function getGroupActivity(group: Group): Activity[] {
  const activities: Activity[] = [];
  
  // Add expenses as activities
  group.expenses.forEach((expense) => {
    activities.push({
      id: expense.id,
      groupId: group.id,
      type: 'expense',
      description: `Expense: ${expense.title} (${expense.amount})`,
      amount: expense.amount,
      date: expense.date,
    });
  });
  
  // Add adjustments as activities
  group.adjustments.forEach((adjustment) => {
    activities.push({
      id: adjustment.id,
      groupId: group.id,
      type: 'adjustment',
      description: `Adjustment: ${adjustment.description} (${adjustment.amount})`,
      amount: adjustment.amount,
      date: adjustment.date,
    });
  });
  
  // Sort by date (newest first)
  return activities.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
