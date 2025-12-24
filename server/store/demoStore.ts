import { Member, Group, Expense, ExpenseBase, MemberBalance, SettlementPair, SplitType, ExpenseSplit, ExpenseCategory, MemberRole } from "@shared/api";

// In-memory demo state
interface DemoState {
  users: { userId: string; name: string; mobile: string }[];
  groups: Group[];
  expenses: Expense[];
  counters: Record<string, number>;
}

const state: DemoState = {
  users: [],
  groups: [],
  expenses: [],
  counters: { user: 3, member: 3, group: 1, expense: 2 },
};

function nextId(prefix: string) {
  state.counters[prefix] = (state.counters[prefix] || 0) + 1;
  return `${prefix}${state.counters[prefix]}`;
}

function seedDemo() {
  state.users = [
    { userId: "u1", name: "Demo User", mobile: "9999999999" },
    { userId: "u2", name: "Alice", mobile: "8888888888" },
    { userId: "u3", name: "Bob", mobile: "7777777777" },
  ];

  const members: Member[] = [
    { memberId: "u1", name: "Demo User", mobile: "9999999999", upiId: "DEMO_UPI@upi", role: 'admin' as MemberRole },
    { memberId: "u2", name: "Alice", mobile: "8888888888", upiId: "ALICE_UPI@upi", role: 'member' as MemberRole },
    { memberId: "u3", name: "Bob", mobile: "7777777777", upiId: "BOB_UPI@upi", role: 'member' as MemberRole },
  ];

  state.groups = [
    {
      groupId: "g1",
      groupName: "Demo Group",
      description: "A demo FairSplit group",
      baseCurrency: "INR",
      members,
      createdBy: "u1",
      customCategories: []
    },
  ];

  state.expenses = [
    {
      expenseId: "e1",
      groupId: "g1",
      paidBy: "u1",
      amount: 600,
      description: "Dinner",
      category: 'food',
      splitType: "equal",
      splitDetails: [
        { memberId: 'u1', amount: 200 },
        { memberId: 'u2', amount: 200 },
        { memberId: 'u3', amount: 200 }
      ],
      timestamp: new Date().toISOString(),
    },
    {
      expenseId: "e2",
      groupId: "g1",
      paidBy: "u2",
      amount: 300,
      description: "Movie tickets",
      category: 'entertainment',
      splitType: "custom",
      splitDetails: [
        { memberId: 'u1', amount: 100 },
        { memberId: 'u2', amount: 100 },
        { memberId: 'u3', amount: 100 }
      ],
      timestamp: new Date().toISOString(),
    },
  ];

  state.counters = { user: 3, member: 3, group: 1, expense: 2 };
}

seedDemo();

export function resetDemo() {
  seedDemo();
}

export function getUserByMobile(mobile: string) {
  return state.users.find((u) => u.mobile === mobile) || null;
}

export function getDemoUser() {
  return state.users.find((u) => u.userId === "u1")!;
}

export function addGroup(input: { 
  groupName: string; 
  description?: string; 
  baseCurrency?: "INR"; 
  members?: Omit<Member, "memberId" | "role">[];
  customCategories?: string[];
  createdBy: string; // userId of the creator
}) {
  const groupId = `g${nextId("group_")}`.replace("group_", "");
  const baseCurrency: "INR" = "INR";
  const baseMembers = (input.members && input.members.length
    ? input.members
    : state.users.map((u, index) => ({
      memberId: u.userId,
      name: u.name,
      mobile: u.mobile,
      upiId: `${u.name.toUpperCase().split(" ").join("_")}_UPI@upi`,
      role: index === 0 ? 'admin' : 'member' as MemberRole
    }))
  );
  const members: Member[] = baseMembers.map((m: any, index: number) => {
    const memberId: string = typeof m.memberId === "string" && m.memberId.length
      ? m.memberId
      : `u${nextId("member_")}`.replace("member_", "");
    // First member is the creator and gets admin role, others get member role by default
    const role: MemberRole = index === 0 ? 'admin' : 'member';
    return { 
      name: m.name, 
      mobile: m.mobile, 
      upiId: m.upiId, 
      memberId,
      role
    } as Member;
  });

  const group: Group = {
    groupId,
    groupName: input.groupName,
    description: input.description || '',
    baseCurrency,
    members,
    customCategories: input.customCategories || [],
    createdBy: input.createdBy
  };
  state.groups.push(group);
  return group;
}

export function addCustomCategory(groupId: string, category: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  if (!group.customCategories) {
    group.customCategories = [];
  }
  
  // Don't add duplicates
  const normalizedCategory = category.toLowerCase().trim();
  if (!group.customCategories.includes(normalizedCategory)) {
    group.customCategories.push(normalizedCategory);
  }
  
  return true;
}

export function getGroup(groupId: string) {
  return state.groups.find((g) => g.groupId === groupId) || null;
}

export function getUserRoleInGroup(groupId: string, userId: string): MemberRole | null {
  const group = getGroup(groupId);
  if (!group) return null;
  const member = group.members.find(m => m.memberId === userId);
  return member ? member.role : null;
}

export function isGroupAdmin(groupId: string, userId: string): boolean {
  return getUserRoleInGroup(groupId, userId) === 'admin';
}

export function updateMemberRole(groupId: string, memberId: string, newRole: MemberRole, requestedBy: string) {
  const group = getGroup(groupId);
  if (!group) return { success: false, error: 'Group not found' };
  
  // Only admins can change roles
  if (!isGroupAdmin(groupId, requestedBy)) {
    return { success: false, error: 'Only group admins can change member roles' };
  }
  
  // Find the target member
  const member = group.members.find(m => m.memberId === memberId);
  if (!member) {
    return { success: false, error: 'Member not found in group' };
  }
  
  // Prevent changing role of the last admin
  if (member.role === 'admin' && newRole === 'member') {
    const adminCount = group.members.filter(m => m.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, error: 'Cannot remove the last admin' };
    }
  }
  
  member.role = newRole;
  return { success: true, member };
}

export function addMemberToGroup(groupId: string, member: Omit<Member, "memberId" | "role">, addedByUserId: string) {
  const group = getGroup(groupId);
  if (!group) return null;
  
  // Check if the user adding the member is an admin
  const adder = group.members.find(m => m.memberId === addedByUserId);
  if (!adder || adder.role !== 'admin') {
    return { error: 'Only group admins can add members' };
  }
  
  // Check if member already exists
  if (group.members.some(m => m.mobile === member.mobile)) {
    return { error: 'Member already exists in the group' };
  }
  
  const newMember: Member = { 
    ...member, 
    memberId: `u${nextId("member_")}`.replace("member_", ""),
    role: 'member' // New members are always added as regular members by default
  };
  
  group.members.push(newMember);
  return { success: true, member: newMember };
}

export function removeMemberFromGroup(groupId: string, memberId: string, requestedBy: string) {
  const group = getGroup(groupId);
  if (!group) return { ok: false, reason: "Group not found" } as const;
  
  // Check if the requester is an admin
  const requester = group.members.find(m => m.memberId === requestedBy);
  if (!requester || requester.role !== 'admin') {
    return { ok: false, reason: "Only group admins can remove members" } as const;
  }
  
  // Prevent removing the last admin
  const targetMember = group.members.find(m => m.memberId === memberId);
  if (targetMember?.role === 'admin') {
    const adminCount = group.members.filter(m => m.role === 'admin').length;
    if (adminCount <= 1) {
      return { ok: false, reason: "Cannot remove the last admin" } as const;
    }
  }
  
  const used = state.expenses.some((e) => e.groupId === groupId && e.paidBy === memberId);
  if (used) return { ok: false, reason: "Member has expenses and cannot be removed in demo" } as const;
  
  const before = group.members.length;
  group.members = group.members.filter((m) => m.memberId !== memberId);
  return { 
    ok: group.members.length < before,
    reason: group.members.length < before ? undefined : "Member not found"
  } as const;
}

function validateAndNormalizeExpenseSplit(
  expense: Omit<ExpenseBase, "expenseId" | "groupId" | "timestamp">, 
  groupMembers: Member[]
): ExpenseSplit[] {
  const { amount, splitType, splitDetails = [], paidBy } = expense;
  
  // Ensure the payer is included in the group
  if (!groupMembers.some(m => m.memberId === paidBy)) {
    throw new Error(`Payer ${paidBy} is not a member of the group`);
  }
  
  // If no split details provided, default to equal split
  if (splitDetails.length === 0) {
    const perPerson = round2(amount / groupMembers.length);
    return groupMembers.map(member => ({
      memberId: member.memberId,
      amount: perPerson
    }));
  }

  // Validate split details
  if (splitType === 'equal') {
    const perPerson = round2(amount / groupMembers.length);
    return groupMembers.map(member => ({
      memberId: member.memberId,
      amount: perPerson
    }));
  } 
  
  if (splitType === 'percentage') {
    const totalPercentage = splitDetails.reduce((sum, d) => sum + (d.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Total percentage must be 100%');
    }
    
    return splitDetails.map(d => ({
      memberId: d.memberId,
      amount: round2((d.percentage! / 100) * amount),
      percentage: d.percentage
    }));
  }
  
  // For custom split, just validate the total matches
  if (splitType === 'custom') {
    const total = splitDetails.reduce((sum, d) => sum + d.amount, 0);
    if (Math.abs(total - amount) > 0.01) {
      throw new Error(`Custom split total (${total}) does not match expense amount (${amount})`);
    }
    return splitDetails.map(d => ({
      memberId: d.memberId,
      amount: d.amount
    }));
  }
  
  throw new Error(`Invalid split type: ${splitType}`);
}

export function addExpenseToGroup(
  groupId: string, 
  expense: Omit<ExpenseBase, "expenseId" | "groupId" | "timestamp"> & { 
    timestamp?: string;
    category?: ExpenseCategory;
  }
) {
  const group = getGroup(groupId);
  if (!group) return null;
  if (!group.members.some((m) => m.memberId === expense.paidBy)) return null;
  
  const amount = Math.max(0, Number(expense.amount || 0));
  const splitType = expense.splitType || 'equal';
  
  try {
    // Create a validated expense with normalized split details
    const validatedExpense = {
      ...expense,
      amount,
      splitType,
      category: expense.category || 'other',
      description: expense.description || '',
      timestamp: expense.timestamp || new Date().toISOString(),
    };
    
    const splitDetails = validateAndNormalizeExpenseSplit(
      validatedExpense,
      group.members
    );
    
    const expenseId = `e${nextId("expense_")}`.replace("expense_", "");
    const newExpense: Expense = {
      ...validatedExpense,
      expenseId,
      groupId,
      splitDetails, // This is now guaranteed to be defined
    };
    
    state.expenses.push(newExpense);
    return newExpense;
  } catch (error) {
    console.error('Error adding expense:', error);
    return null;
  }
}

export function getExpenses(groupId: string) {
  return state.expenses.filter((e) => e.groupId === groupId);
}

export function computeBalances(groupId: string): { balances: MemberBalance[]; totalAmount: number; perHead: number } {
  const group = getGroup(groupId);
  if (!group) return { balances: [], totalAmount: 0, perHead: 0 };
  
  const expenses = getExpenses(groupId);
  const totalAmount = round2(expenses.reduce((sum, e) => sum + e.amount, 0));
  
  // Initialize maps to track amounts
  const paidMap = new Map<string, number>();
  const shouldPayMap = new Map<string, number>();
  
  // Initialize with all members
  group.members.forEach(member => {
    paidMap.set(member.memberId, 0);
    shouldPayMap.set(member.memberId, 0);
  });
  
  // Calculate amounts paid by each member
  for (const expense of expenses) {
    // Add to paid amount for the payer
    paidMap.set(
      expense.paidBy, 
      round2((paidMap.get(expense.paidBy) || 0) + expense.amount)
    );
    
    // Add to shouldPay for each member based on split details
    for (const split of expense.splitDetails) {
      shouldPayMap.set(
        split.memberId,
        round2((shouldPayMap.get(split.memberId) || 0) + split.amount)
      );
    }
  }
  
  // Calculate balances
  const balances: MemberBalance[] = group.members.map((member) => {
    const paid = paidMap.get(member.memberId) || 0;
    const shouldPay = shouldPayMap.get(member.memberId) || 0;
    const balance = round2(paid - shouldPay);
    
    return { 
      memberId: member.memberId, 
      paid, 
      shouldPay, 
      balance 
    };
  });
  
  // Calculate per head (average) for backward compatibility
  const perHead = round2(totalAmount / (group.members.length || 1));
  
  return { 
    balances, 
    totalAmount, 
    perHead 
  };
}

export function computeSettlement(groupId: string): SettlementPair[] {
  const group = getGroup(groupId);
  if (!group) return [];
  
  const { balances } = computeBalances(groupId);
  
  // Get debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.balance < -0.01) // Small threshold to avoid floating point issues
    .map((b) => ({ 
      id: b.memberId, 
      amount: round2(-b.balance),
      name: group.members.find(m => m.memberId === b.memberId)?.name || b.memberId,
      upiId: group.members.find(m => m.memberId === b.memberId)?.upiId || ''
    }));
    
  const creditors = balances
    .filter((b) => b.balance > 0.01) // Small threshold to avoid floating point issues
    .map((b) => ({ 
      id: b.memberId, 
      amount: round2(b.balance),
      name: group.members.find(m => m.memberId === b.memberId)?.name || b.memberId,
      upiId: group.members.find(m => m.memberId === b.memberId)?.upiId || ''
    }));
  
  // Sort for greedy algorithm: largest amounts first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const pairs: SettlementPair[] = [];
  let i = 0, j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const pay = round2(Math.min(debtor.amount, creditor.amount));
    if (pay > 0.01) { // Only add if amount is significant (1 paisa threshold)
      // Create a UPI deep link for the payment
      const upiLink = `upi://pay?pa=${encodeURIComponent(creditor.upiId)}&am=${pay.toFixed(2)}&cu=INR&tn=FairSplit%20Settlement&pn=${encodeURIComponent(creditor.name)}`;
      
      pairs.push({
        from: debtor.id,
        to: creditor.id,
        amount: pay,
        upiLink,
      });
      
      // Update the amounts
      debtor.amount = round2(debtor.amount - pay);
      creditor.amount = round2(creditor.amount - pay);
    }
    
    // Move to next debtor or creditor if current one is settled
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }
  
  return pairs;
}

function round2(v: number) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
