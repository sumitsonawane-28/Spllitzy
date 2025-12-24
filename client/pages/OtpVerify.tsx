import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/store/expenseStore';

export default function OtpVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const { setUser } = useExpenseStore();

  useEffect(() => {
    const pendingPhone = sessionStorage.getItem('pendingPhone');
    if (!pendingPhone) {
      navigate('/login');
      return;
    }
    setPhone(pendingPhone);
  }, [navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    // Dummy OTP: 123456
    if (otpCode !== '123456') {
      setError('Invalid OTP. Try 123456 for demo');
      return;
    }

    // Create user and set session
    const userId = `user_${Date.now()}`;
    setUser({
      id: userId,
      phone: phone,
      name: `User ${phone.slice(-4)}`,
    });

    sessionStorage.removeItem('pendingPhone');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
            <p className="text-gray-600 text-sm">
              Enter the OTP sent to<br />
              <span className="font-medium">{phone}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">Demo OTP: 123456</p>
              <p className="text-xs">Use this code to test the app</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Verify OTP
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Use a different number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
