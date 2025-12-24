import { RequestHandler } from "express";
import { ok, fail } from "../utils/response";
import {
  addExpenseToGroup,
  addMemberToGroup,
  addGroup,
  computeBalances,
  computeSettlement,
  getExpenses,
  getGroup,
  removeMemberFromGroup,
  updateMemberRole,
  isGroupAdmin,
  getUserRoleInGroup,
} from "../store/demoStore";
import { requireAdmin, requireGroupMember } from "../middleware/roleAuth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const createGroup: RequestHandler = (req, res) => {
  const { groupName, description, members, userId } = req.body || {};
  if (!groupName) return fail(res, "groupName is required");
  if (!userId) return fail(res, "userId is required");
  
  const group = addGroup({ 
    groupName, 
    description, 
    members,
    createdBy: userId 
  });
  
  return ok(res, group, "Group created");
};

export const getGroupById: RequestHandler = (req, res) => {
  const { groupId } = req.params;
  const userId = req.query.userId as string;
  
  if (!userId) {
    return fail(res, "User ID is required");
  }
  
  const group = getGroup(groupId);
  if (!group) return fail(res, "Group not found", null, 404);
  
  // Check if user is a member of the group
  const isMember = group.members.some(m => m.memberId === userId);
  if (!isMember) {
    return fail(res, "You are not a member of this group", null, 403);
  }
  
  // Return group with user's role
  const userRole = getUserRoleInGroup(groupId, userId);
  return ok(res, {
    ...group,
    userRole,
    isAdmin: userRole === 'admin'
  });
};

export const updateMember: RequestHandler = (req, res) => {
  const { groupId, memberId } = req.params;
  const { role } = req.body;
  const userId = req.body.userId;
  
  if (!userId) {
    return fail(res, "User ID is required");
  }
  
  if (role !== 'admin' && role !== 'member') {
    return fail(res, "Invalid role. Must be 'admin' or 'member'");
  }
  
  const result = updateMemberRole(groupId, memberId, role, userId);
  
  if (!result.success) {
    return fail(res, result.error || "Failed to update member role");
  }
  
  return ok(res, result.member, "Member role updated successfully");
};

export const addMember: RequestHandler = (req, res) => {
  const { groupId } = req.params;
  const { name, mobile, upiId } = req.body;
  const userId = req.body.userId;
  
  if (!name || !mobile) {
    return fail(res, "Name and mobile are required for new member");
  }
  
  if (!userId) {
    return fail(res, "User ID is required");
  }
  
  const result = addMemberToGroup(groupId, { name, mobile, upiId }, userId);
  
  if ('error' in result) {
    return fail(res, result.error);
  }
  
  return ok(res, result.member, "Member added to group");
};

export const removeMember: RequestHandler = (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.body.userId || req.query.userId;
  
  if (!userId) {
    return fail(res, "User ID is required");
  }
  
  const result = removeMemberFromGroup(groupId, memberId, userId);
  if (!result.ok) {
    return fail(res, result.reason || "Failed to remove member from group");
  }
  return ok(res, null, "Member removed from group");
};

export const addExpense: RequestHandler = (req, res) => {
  const { groupId } = req.params;
  const { userId, ...expense } = req.body;
  
  if (!userId) {
    return fail(res, "User ID is required");
  }
  
  // Verify the user is a member of the group
  const group = getGroup(groupId);
  if (!group) {
    return fail(res, "Group not found", null, 404);
  }
  
  const isMember = group.members.some(m => m.memberId === userId);
  if (!isMember) {
    return fail(res, "You must be a member of the group to add expenses", null, 403);
  }
  
  const result = addExpenseToGroup(groupId, { ...expense, paidBy: expense.paidBy || userId });
  if (!result) return fail(res, "Failed to add expense to group");
  return ok(res, result, "Expense added to group");
};

export const listExpenses: RequestHandler = (req, res) => {
  const { groupId } = req.params;
  const group = getGroup(groupId);
  if (!group) return fail(res, "Group not found", null, 404);
  const expenses = getExpenses(groupId);
  const summary = computeBalances(groupId);
  return ok(res, { expenses, ...summary });
};

export const getSettlement: RequestHandler = (req, res) => {
  const { groupId } = req.params;
  const userId = req.query.userId as string;
  
  if (!userId) {
    return fail(res, "User ID is required");
  }
  
  // Verify the user is a member of the group
  const group = getGroup(groupId);
  if (!group) {
    return fail(res, "Group not found", null, 404);
  }
  
  const isMember = group.members.some(m => m.memberId === userId);
  if (!isMember) {
    return fail(res, "You must be a member of the group to view settlements", null, 403);
  }
  
  const balances = computeBalances(groupId);
  if (!balances) return fail(res, "Failed to compute balances", null, 500);
  
  const settlement = computeSettlement(balances);
  return ok(res, settlement);
};
