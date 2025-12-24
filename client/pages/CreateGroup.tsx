import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore, Member } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

export default function CreateGroup() {
  const { createGroup } = useExpenseStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'INR',
  });

  const [members, setMembers] = useState<Omit<Member, 'id'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMemberRow = () => {
    setMembers([...members, { name: '', mobile: '', upiId: '' }]);
  };

  const removeMemberRow = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (
    index: number,
    field: keyof Member,
    value: string
  ) => {
    const newMembers = [...members];
    (newMembers[index] as any)[field] = value;
    setMembers(newMembers);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    if (members.length === 0) {
      newErrors.members = 'At least one member is required';
    }

    members.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`member_${index}_name`] = 'Name is required';
      }
      if (!member.mobile.trim()) {
        newErrors[`member_${index}_mobile`] = 'Mobile is required';
      } else if (!/^\d{10}$/.test(member.mobile.replace(/\D/g, ''))) {
        newErrors[`member_${index}_mobile`] = '10-digit phone required';
      }
      if (!member.upiId.trim()) {
        newErrors[`member_${index}_upiId`] = 'UPI ID is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const memberObjects: Member[] = members.map((member, index) => ({
      id: `member_${Date.now()}_${index}`,
      ...member,
    }));

    createGroup({
      name: formData.name,
      description: formData.description,
      currency: formData.currency,
      members: memberObjects,
    });

    navigate('/dashboard');
  };

  return (
    <Layout title="Create Group" showBack>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Group Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Group Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Room Mates, Trip Budget"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Optional description for this group"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add Members
              </h2>
              <Button
                type="button"
                onClick={addMemberRow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Add Member
              </Button>
            </div>

            {errors.members && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-gap-2">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                {errors.members}
              </div>
            )}

            <div className="space-y-4">
              {members.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Click "Add Member" to add group members
                </p>
              ) : (
                members.map((member, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900">
                        Member {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeMemberRow(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="Full name"
                          value={member.name}
                          onChange={(e) =>
                            updateMember(index, 'name', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors[`member_${index}_name`] && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[`member_${index}_name`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mobile *
                        </label>
                        <Input
                          type="tel"
                          placeholder="10-digit number"
                          value={member.mobile}
                          onChange={(e) =>
                            updateMember(index, 'mobile', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors[`member_${index}_mobile`] && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[`member_${index}_mobile`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          UPI ID *
                        </label>
                        <Input
                          type="text"
                          placeholder="name@bank"
                          value={member.upiId}
                          onChange={(e) =>
                            updateMember(index, 'upiId', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors[`member_${index}_upiId`] && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[`member_${index}_upiId`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg transition-colors font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium"
            >
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
