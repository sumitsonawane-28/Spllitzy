import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { User, Phone, LogOut, Edit, X, Check } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { user, logout, setUser } = useExpenseStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditClick = () => {
    setNewName(user.name);
    setIsEditing(true);
  };

  const handleSaveName = () => {
    if (newName.trim() && user) {
      setUser({ ...user, name: newName.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <Layout title="Profile" showBack>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl font-bold h-10"
                      autoFocus
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveName}
                      disabled={!newName.trim()}
                      className="h-10 w-10"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCancelEdit}
                      className="h-10 w-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8"
                      onClick={handleEditClick}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </h2>
                )}
              </div>
              <p className="text-gray-600">Student Account</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              <p className="text-lg text-gray-900 font-medium">{user.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <p className="text-sm text-gray-600 font-mono">{user.id}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Account Settings
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    This is a demo account with no backend storage. All data is
                    stored locally and will be cleared on logout.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
