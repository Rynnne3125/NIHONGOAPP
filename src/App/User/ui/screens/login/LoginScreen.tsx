import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRepository } from '../repositories/UserRepository';

interface LoginScreenProps {
  userRepository: UserRepository;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ userRepository }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      // Clear OneSignal tags (equivalent to Kotlin code)
      // This would need OneSignal SDK integration

      if (isLoggedIn) {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          navigate(`/home/${userEmail}`, { replace: true });
        } else {
          setIsCheckingSession(false);
        }
      } else {
        setIsCheckingSession(false);
      }
    };

    setTimeout(checkSession, 1000);
  }, [navigate]);

  const handleLogin = async () => {
    setMessage('');
    setIsLoading(true);

    try {
      // Validate email
      if (!isValidEmail(email)) {
        setMessage('Vui lòng nhập email hợp lệ.');
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
        setIsLoading(false);
        return;
      }

      // Attempt login
      const user = await userRepository.loginUserByEmail(email, password);

      if (user) {
        // Update user online status
        await userRepository.updateUserOnlineStatus(user.id, true);

        // Save session
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);

        // Navigate to home
        navigate(`/home/${email}`, { replace: true });
      } else {
        setMessage('Sai email hoặc mật khẩu!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <img
            src="https://drive.google.com/uc?export=download&id=1QiO2eVlHxojSL5QGsetoQUhBT5aO7Yvm"
            alt="Logo"
            className="w-48 h-48 mx-auto mb-4"
          />
          <h1 className="text-5xl font-bold text-green-600">NIHONGO</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-green-800 text-center mb-6">
          Đăng nhập
        </h1>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage('');
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              email && !isValidEmail(email)
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Nhập email của bạn"
          />
          {email && !isValidEmail(email) && (
            <p className="text-red-500 text-xs mt-1">Email không hợp lệ</p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {isPasswordVisible ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium text-white transition ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {/* Register Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/register')}
            className="text-green-800 hover:text-green-600 font-medium"
          >
            Chưa có tài khoản? Đăng ký
          </button>
        </div>

        {/* Admin Login Link */}
        <div className="text-center mt-2">
          <button
            onClick={() => navigate('/admin-login')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Đăng nhập với tư cách Admin
          </button>
        </div>

        {/* Error Message */}
        {message && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;