import { RequestHandler } from 'express';
import { getGroup } from '../store/demoStore';
import { MemberRole } from '@shared/api';

type Role = MemberRole | 'any';

interface RoleAuthOptions {
  requireAdmin?: boolean;
  requireRole?: Role;
  allowSelf?: boolean;
}

export function requireGroupAuth(options: RoleAuthOptions = {}): RequestHandler {
  return (req, res, next) => {
    const { requireAdmin = false, requireRole = 'any', allowSelf = false } = options;
    const { groupId } = req.params;
    const userId = req.body.userId || req.query.userId;
    const targetMemberId = req.params.memberId || req.body.memberId;

    if (!groupId) {
      return res.status(400).json({ success: false, error: 'Group ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID is required' });
    }

    const group = getGroup(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const member = group.members.find(m => m.memberId === userId);
    
    // Check if user is a member of the group
    if (!member) {
      return res.status(403).json({ success: false, error: 'You are not a member of this group' });
    }

    // Check admin requirement
    if (requireAdmin && member.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin privileges required' });
    }

    // Check specific role requirement
    if (requireRole !== 'any' && member.role !== requireRole) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    // Check if the action is allowed on self (e.g., updating own profile)
    if (allowSelf && targetMemberId && targetMemberId !== userId) {
      // If it's not a self-action, require admin privileges
      if (member.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'You can only perform this action on yourself or as an admin' 
        });
      }
    }

    // Attach user role to the request for use in route handlers
    req.userRole = member.role;
    req.isGroupAdmin = member.role === 'admin';
    
    next();
  };
}

// Helper middleware for admin-only routes
export const requireAdmin = requireGroupAuth({ requireAdmin: true });

// Helper middleware for any group member
export const requireGroupMember = requireGroupAuth();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userRole?: MemberRole;
      isGroupAdmin?: boolean;
    }
  }
}
