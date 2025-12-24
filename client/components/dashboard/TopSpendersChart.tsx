import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TopSpender } from '@/utils/dashboardUtils';

interface TopSpendersChartProps {
  data: TopSpender[];
  title?: string;
  currency?: string;
}

export function TopSpendersChart({ data, title, currency = '₹' }: TopSpendersChartProps) {
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
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`${currency}${value.toFixed(2)}`, 'Amount']}
              labelStyle={{ color: '#4B5563', fontWeight: 'bold' }}
            />
            <Bar dataKey="amount" name="Amount Spent" fill="#4F46E5" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
