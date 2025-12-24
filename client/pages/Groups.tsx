import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

export default function Groups() {
  const { groups } = useExpenseStore();
  const navigate = useNavigate();

  return (
    <Layout title="Groups">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
          <Button
            onClick={() => navigate('/create-group')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Group
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-4">
              You haven't created any groups yet
            </p>
            <Button
              onClick={() => navigate('/create-group')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const totalAmount = group.expenses.reduce(
                (sum, exp) => sum + exp.amount,
                0
              );
              const memberCount = group.members.length;

              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 overflow-hidden hover:border-blue-300"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>
                  <div className="p-6 relative -mt-12">
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                        {group.description || 'No description'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={16} />
                        <span className="text-sm">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <TrendingDown size={16} />
                        <span className="text-sm font-semibold">
                          {group.currency} {totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
