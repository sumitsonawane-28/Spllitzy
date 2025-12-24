import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyTrend } from '@/utils/dashboardUtils';

interface MonthlyTrendsChartProps {
  data: MonthlyTrend[];
  title?: string;
  currency?: string;
}

export function MonthlyTrendsChart({ data, title, currency = '₹' }: MonthlyTrendsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg">
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `${currency}${value}`}
              width={80}
            />
            <Tooltip 
              formatter={(value: number) => [`${currency}${value.toFixed(2)}`, 'Amount']}
              labelStyle={{ color: '#4B5563', fontWeight: 'bold' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              name="Amount Spent"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
