import { Lightbulb } from 'lucide-react';

interface QuickInsightsProps {
  insights: string[];
}

export function QuickInsights({ insights }: QuickInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <Lightbulb className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3
        ">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Quick Insights</h3>
          <ul className="space-y-1.5">
            {insights.map((insight, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
