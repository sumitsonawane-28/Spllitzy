import { ArrowUpCircle, ArrowDownCircle, DollarSign, Users } from 'lucide-react';
import { DashboardSummary } from '@/utils/dashboardUtils';

interface DashboardOverviewProps {
  summary: DashboardSummary;
}

export function DashboardOverview({ summary }: DashboardOverviewProps) {
  const { totalSpentByUser, totalSpentByGroup, userBalance, currency } = summary;
  
  const isPositive = userBalance >= 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent by You</p>
            <p className="text-2xl font-bold text-gray-900">
              {currency} {totalSpentByUser.toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-full bg-blue-50">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Group Spending</p>
            <p className="text-2xl font-bold text-gray-900">
              {currency} {totalSpentByGroup.toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-full bg-green-50">
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {isPositive ? 'You are owed' : 'You owe'}
            </p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{currency} {Math.abs(userBalance).toFixed(2)}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
            {isPositive ? (
              <ArrowDownCircle className="h-6 w-6 text-green-600" />
            ) : (
              <ArrowUpCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Groups</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.groupsCount || 0} Active
            </p>
          </div>
          <div className="p-3 rounded-full bg-purple-50">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
