import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseStore, Member } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import {
  Plus,
  MoreVertical,
  TrendingUp,
  History,
  Wallet,
  Trash2,
  X,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

type TabType = 'expenses' | 'balances' | 'activity' | 'budget';

export default function GroupDetails() {
  const { groupId } = useParams<{ groupId: string }>();
  const { getGroup, deleteExpense, deleteAdjustment, getBalances, getActivityLog } =
    useExpenseStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMember, setNewMember] = useState<Omit<Member, 'id'>>({ 
    name: '', 
    mobile: '', 
    upiId: '' 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!groupId) {
    navigate('/dashboard');
    return null;
  }

  const group = getGroup(groupId);

  if (!group) {
    return (
      <Layout title="Group Not Found" showBack>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Group not found</p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const balances = getBalances(groupId);
  const activities = getActivityLog(groupId);

  const getMemberName = (memberId: string) => {
    return group.members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  const renderExpensesTab = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={() => navigate(`/group/${groupId}/add-expense`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Expense
        </Button>
      </div>

      {group.expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No expenses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {group.expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {expense.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Paid by {getMemberName(expense.paidBy)}
                      </p>
                    </div>
                  </div>
                  {expandedExpense === expense.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Category:</strong> {expense.category}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Description:</strong> {expense.description}
                      </p>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Split:
                        </p>
                        <div className="space-y-1 text-sm">
                          {Object.entries(expense.splits).map(
                            ([memberId, amount]) => (
                              <div
                                key={memberId}
                                className="flex justify-between text-gray-600"
                              >
                                <span>{getMemberName(memberId)}</span>
                                <span>
                                  {group.currency} {(amount as number).toFixed(2)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-gray-900">
                    {group.currency} {expense.amount.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setExpandedExpense(
                          expandedExpense === expense.id ? null : expense.id
                        )
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical size={18} />
                    </button>
                    <button
                      onClick={() => deleteExpense(groupId, expense.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleAddMember = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newMember.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!newMember.mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
    } else if (!/^\d{10}$/.test(newMember.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = '10-digit phone required';
    }
    if (!newMember.upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const { addMember } = useExpenseStore.getState();
    addMember(groupId, {
      ...newMember,
      id: `member_${Date.now()}`,
    });
    
    setNewMember({ name: '', mobile: '', upiId: '' });
    setShowAddMemberForm(false);
    setErrors({});
  };

  const handleRemoveMember = (memberId: string) => {
    if (group.members.length <= 1) {
      setErrors({ members: 'Cannot remove the last member' });
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
      const { removeMember } = useExpenseStore.getState();
      removeMember(groupId, memberId);
    }
  };

  const renderBalancesTab = () => {
    const settledMembers = new Set<string>();
    const debts: Array<{
      from: string;
      to: string;
      amount: number;
    }> = [];

    // Calculate who owes whom
    Object.entries(balances).forEach(([memberId, balance]) => {
      if (balance < 0) {
        // This person owes money
        let amountToSettle = Math.abs(balance);

        Object.entries(balances).forEach(([otherMemberId, otherBalance]) => {
          if (otherMemberId !== memberId && otherBalance > 0 && amountToSettle > 0) {
            const settlementAmount = Math.min(amountToSettle, otherBalance);
            debts.push({
              from: memberId,
              to: otherMemberId,
              amount: settlementAmount,
            });
            amountToSettle -= settlementAmount;
          }
        });
      }
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Group Members</h3>
          <Button
            onClick={() => setShowAddMemberForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <UserPlus size={16} />
            Add Member
          </Button>
        </div>

        {showAddMemberForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">Add New Member</h4>
              <button
                onClick={() => {
                  setShowAddMemberForm(false);
                  setErrors({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={newMember.name}
                  onChange={(e) => {
                    setNewMember({ ...newMember, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className="w-full"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile *
                </label>
                <Input
                  type="tel"
                  placeholder="10-digit number"
                  value={newMember.mobile}
                  onChange={(e) => {
                    setNewMember({ ...newMember, mobile: e.target.value });
                    if (errors.mobile) setErrors({ ...errors, mobile: '' });
                  }}
                  className="w-full"
                />
                {errors.mobile && (
                  <p className="text-red-600 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID *
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="name@bank"
                    value={newMember.upiId}
                    onChange={(e) => {
                      setNewMember({ ...newMember, upiId: e.target.value });
                      if (errors.upiId) setErrors({ ...errors, upiId: '' });
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add
                  </Button>
                </div>
                {errors.upiId && (
                  <p className="text-red-600 text-xs mt-1">{errors.upiId}</p>
                )}
              </div>
            </div>
            
            {errors.members && (
              <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.members}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-gray-200 rounded-lg p-4 relative group"
            >
              {group.members.length > 1 && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove member"
                >
                  <X size={18} />
                </button>
              )}
              <h4 className="font-semibold text-gray-900 pr-6">{member.name}</h4>
              <div className="space-y-2 mt-2">
                <p className="text-sm text-gray-600">
                  Mobile: <span className="font-medium">{member.mobile}</span>
                </p>
                <p className="text-sm text-gray-600">
                  UPI: <span className="font-medium">{member.upiId}</span>
                </p>
                <div
                  className={`mt-3 p-3 rounded-lg text-center font-semibold ${
                    balances[member.id] >= 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {balances[member.id] >= 0 ? '+' : ''}
                  {group.currency} {balances[member.id].toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Settlement Summary</h3>
          {debts.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              Everyone is settled up! 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {debts.map((debt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getMemberName(debt.from)} owes{' '}
                      <span className="text-blue-600">{getMemberName(debt.to)}</span>
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {group.currency} {debt.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={() => navigate(`/group/${groupId}/settle-up`)}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
          >
            Settle Up
          </Button>
        </div>

        <Button
          onClick={() => navigate(`/group/${groupId}/manual-adjustment`)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium"
        >
          Add Manual Adjustment
        </Button>
      </div>
    );
  };

  const renderBudgetTab = () => (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Group Budget</h3>
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Track and manage your group's budget</p>
          <p className="text-sm text-gray-500 mt-2">Set spending limits and track expenses by category</p>
          <Button
            onClick={() => navigate(`/groups/${groupId}/budget`)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Manage Budget
          </Button>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => {
    const allActivities = [
      ...group.expenses.map(expense => ({
        ...expense,
        type: 'expense' as const,
      })),
      ...group.adjustments.map(adj => ({
        ...adj,
        type: 'adjustment' as const,
      })),
      ...activities
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-4">
        {allActivities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <History size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allActivities.map((item, index) => {
              // Handle budget activities
              if ('type' in item && (item.type === 'budget_created' || item.type === 'budget_updated')) {
                return (
                  <div key={`${item.type}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <TrendingUp size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.type === 'budget_created' ? 'Budget Created' : 'Budget Updated'}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.budgetData && (
                          <div className="mt-2 text-sm">
                            <p className="font-medium">Budget Details:</p>
                            <p>Total: {group.currency} {item.budgetData.totalBudget.toFixed(2)}</p>
                            <p>Period: {item.budgetData.periodType}</p>
                            {item.budgetData.categories.length > 0 && (
                              <div className="mt-1">
                                <p className="font-medium">Categories:</p>
                                <ul className="list-disc pl-5">
                                  {item.budgetData.categories.map((cat, i) => (
                                    <li key={i}>
                                      {cat.name}: {group.currency} {cat.limit.toFixed(2)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(item.date).toLocaleDateString()} at{' '}
                          {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {group.currency} {item.amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                );
              }
              
              // Handle regular expenses and adjustments
              if ('title' in item) {
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <TrendingUp size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.date).toLocaleDateString()} at{' '}
                          {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {group.currency} {item.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Adjustment: {getMemberName(item.from)} → {getMemberName(item.to)}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.date).toLocaleDateString()} at{' '}
                          {new Date(item.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {group.currency} {item.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout title={group.name} showBack>
      <div className="space-y-6">
        {/* Group Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm">Currency</p>
              <p className="text-xl font-bold text-gray-900">{group.currency}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Members</p>
              <p className="text-xl font-bold text-gray-900">
                {group.members.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900">
                {group.currency}{' '}
                {group.expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
          {group.description && (
            <p className="text-gray-600 text-sm">{group.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {(['expenses', 'balances', 'budget', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'expenses' && renderExpensesTab()}
          {activeTab === 'balances' && renderBalancesTab()}
          {activeTab === 'budget' && renderBudgetTab()}
          {activeTab === 'activity' && renderActivityTab()}
        </div>
      </div>
    </Layout>
  );
}
