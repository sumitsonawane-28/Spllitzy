import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';

export default function ManualAdjustment() {
  const { groupId } = useParams<{ groupId: string }>();
  const { getGroup, addAdjustment, addActivity } = useExpenseStore();
  const navigate = useNavigate();

  const group = getGroup(groupId || '');

  if (!groupId || !group) {
    navigate('/dashboard');
    return null;
  }

  const [formData, setFormData] = useState({
    from: group.members[0]?.id || '',
    to: group.members[1]?.id || group.members[0]?.id || '',
    amount: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (formData.from === formData.to) {
      newErrors.to = 'From and to must be different members';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const fromName = group.members.find((m) => m.id === formData.from)?.name;
    const toName = group.members.find((m) => m.id === formData.to)?.name;

    addAdjustment(groupId, {
      from: formData.from,
      to: formData.to,
      amount: parseFloat(formData.amount),
      description: formData.description,
      groupId,
    });

    addActivity({
      groupId,
      type: 'adjustment',
      description: `${fromName} adjusted payment to ${toName}`,
      amount: parseFloat(formData.amount),
    });

    navigate(`/group/${groupId}`);
  };

  return (
    <Layout title="Manual Adjustment" showBack>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Add Manual Adjustment
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Member *
                </label>
                <select
                  value={formData.from}
                  onChange={(e) =>
                    setFormData({ ...formData, from: e.target.value })
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

              <div className="flex justify-center">
                <div className="text-2xl text-gray-400">→</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Member *
                </label>
                <select
                  value={formData.to}
                  onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.to && (
                  <p className="text-red-600 text-sm mt-1">{errors.to}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({group.currency}) *
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
                  Description
                </label>
                <textarea
                  placeholder="Optional reason for this adjustment"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

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
              Add Adjustment
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
