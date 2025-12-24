import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { AlertCircle } from 'lucide-react';

type SplitType = 'equal' | 'custom';

export default function AddExpense() {
  const { groupId } = useParams<{ groupId: string }>();
  const { getGroup, addExpense, addActivity } = useExpenseStore();
  const navigate = useNavigate();

  const group = getGroup(groupId || '');

  if (!groupId || !group) {
    navigate('/dashboard');
    return null;
  }

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    description: '',
    paidBy: group.members[0]?.id || '',
  });

  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize custom splits
  const handleSplitTypeChange = (type: SplitType) => {
    setSplitType(type);
    if (type === 'equal') {
      setCustomSplits({});
    } else {
      const splits: Record<string, string> = {};
      group.members.forEach((member) => {
        splits[member.id] = (
          parseFloat(formData.amount) / group.members.length
        ).toFixed(2);
      });
      setCustomSplits(splits);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (splitType === 'custom') {
      const splitTotal = Object.values(customSplits).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      if (Math.abs(splitTotal - amount) > 0.01) {
        newErrors.splits = `Split total must equal amount (${splitTotal.toFixed(2)} != ${amount.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const splits: Record<string, number> = {};

    if (splitType === 'equal') {
      const splitAmount = amount / group.members.length;
      group.members.forEach((member) => {
        splits[member.id] = parseFloat(splitAmount.toFixed(2));
      });
    } else {
      group.members.forEach((member) => {
        splits[member.id] = parseFloat(customSplits[member.id] || '0');
      });
    }

    addExpense(groupId, {
      title: formData.title,
      amount,
      category: formData.category,
      description: formData.description,
      paidBy: formData.paidBy,
      splits,
      groupId,
    });

    addActivity({
      groupId,
      type: 'expense',
      description: `Added expense: ${formData.title}`,
      amount,
    });

    navigate(`/group/${groupId}`);
  };

  const amount = parseFloat(formData.amount) || 0;
  const splitAmount = amount / group.members.length;

  return (
    <Layout title="Add Expense" showBack>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expense Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Expense Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Dinner, Movie tickets"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.amount && (
                    <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Entertainment</option>
                    <option>Utilities</option>
                    <option>Shopping</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Optional details about this expense"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid By *
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) =>
                    setFormData({ ...formData, paidBy: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Split Options */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              How to split?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{borderColor: splitType === 'equal' ? '#2563eb' : undefined, backgroundColor: splitType === 'equal' ? '#eff6ff' : undefined}}>
                  <input
                    type="radio"
                    name="split"
                    checked={splitType === 'equal'}
                    onChange={() => handleSplitTypeChange('equal')}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Split Equally</p>
                    <p className="text-sm text-gray-600">
                      Each person pays {group.currency} {splitAmount.toFixed(2)}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{borderColor: splitType === 'custom' ? '#2563eb' : undefined, backgroundColor: splitType === 'custom' ? '#eff6ff' : undefined}}>
                  <input
                    type="radio"
                    name="split"
                    checked={splitType === 'custom'}
                    onChange={() => handleSplitTypeChange('custom')}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <p className="font-medium text-gray-900">Custom Split</p>
                </label>
              </div>
            </div>

            {splitType === 'custom' && (
              <div className="mt-6 space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex gap-2">
                  <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Split must total {group.currency} {amount.toFixed(2)}
                  </p>
                </div>

                {group.members.map((member) => (
                  <div key={member.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {member.name}
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={customSplits[member.id] || ''}
                      onChange={(e) =>
                        setCustomSplits({
                          ...customSplits,
                          [member.id]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}

                {errors.splits && (
                  <p className="text-red-600 text-sm mt-2">{errors.splits}</p>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Total:</strong> {group.currency}{' '}
                    {Object.values(customSplits)
                      .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => navigate(`/group/${groupId}`)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg transition-colors font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium"
            >
              Save Expense
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
