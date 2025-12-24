import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategorySpending } from '@/utils/dashboardUtils';

interface SpendingPieChartProps {
  data: CategorySpending[];
  title?: string;
}

export function SpendingPieChart({ data, title }: SpendingPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg">
        <p className="text-gray-500">No spending data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="amount"
              nameKey="category"
              label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
              labelStyle={{ color: '#4B5563', fontWeight: 'bold' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
