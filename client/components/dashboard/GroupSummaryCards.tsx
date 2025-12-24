import { Users, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { GroupSummary } from '@/utils/dashboardUtils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface GroupSummaryCardsProps {
  groups: GroupSummary[];
  onSettleUp?: (groupId: string) => void;
}

export function GroupSummaryCards({ groups, onSettleUp }: GroupSummaryCardsProps) {
  const navigate = useNavigate();

  if (groups.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
        <p className="text-gray-500 mb-4">Create a group to start tracking expenses</p>
        <Button onClick={() => navigate('/create-group')}>
          Create Group
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Your Groups</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div 
            key={group.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/group/${group.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <p className="text-sm text-gray-500">{group.memberCount} members</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {group.currency} {group.totalExpenses.toFixed(2)}
                </div>
                <div 
                  className={`text-xs ${group.userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {group.userBalance >= 0 ? 'You get ' : 'You owe '}
                  {group.currency} {Math.abs(group.userBalance).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 truncate pr-2">
                {group.recentActivity}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSettleUp) onSettleUp(group.id);
                }}
                disabled={Math.abs(group.userBalance) < 0.01}
                className="ml-2"
              >
                Settle Up
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
