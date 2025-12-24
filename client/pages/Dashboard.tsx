import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { SpendingPieChart } from '@/components/dashboard/SpendingPieChart';
import { TopSpendersChart } from '@/components/dashboard/TopSpendersChart';
import { MonthlyTrendsChart } from '@/components/dashboard/MonthlyTrendsChart';
import { QuickInsights } from '@/components/dashboard/QuickInsights';
import { 
  calculateDashboardSummary, 
  getGroupSummaries, 
  getCategorySpending, 
  getTopSpenders, 
  getMonthlyTrends,
  getQuickInsights
} from '@/utils/dashboardUtils';
import { useState } from 'react';

export default function Dashboard() {
  const { user, groups } = useExpenseStore();
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Calculate dashboard data
  const dashboardSummary = calculateDashboardSummary(groups, user.id);
  const categorySpending = getCategorySpending(groups, selectedGroupId);
  const topSpenders = getTopSpenders(groups, selectedGroupId);
  const monthlyTrends = getMonthlyTrends(selectedGroupId ? groups.filter(g => g.id === selectedGroupId) : groups);
  const insights = getQuickInsights(groups, user.id);

  const handleGroupFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupId(e.target.value || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100">Here's what's happening with your expenses</p>
      </div>

      {/* Dashboard Overview */}
      <DashboardOverview summary={dashboardSummary} />

      {/* Quick Insights */}
      {insights.length > 0 && <QuickInsights insights={insights} />}

      {/* Group Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Expense Analytics</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="group-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Group:
          </label>
          <select
            id="group-filter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={selectedGroupId || ''}
            onChange={handleGroupFilterChange}
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="lg:col-span-1">
          <SpendingPieChart 
            data={categorySpending} 
            title="Spending by Category"
          />
        </div>

        {/* Monthly Trends */}
        <div className="lg:col-span-1">
          <MonthlyTrendsChart 
            data={monthlyTrends} 
            title="Weekly Spending Trend"
            currency={dashboardSummary.currency}
          />
        </div>

        {/* Top Spenders */}
        <div className="lg:col-span-2">
          <TopSpendersChart 
            data={topSpenders} 
            title="Top Spenders"
            currency={dashboardSummary.currency}
          />
        </div>
      </div>

    </div>
  );
}
