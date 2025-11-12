import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { UserRepository } from '../repositories/UserRepository';
import { EmailSender } from '../utils/EmailSender';

interface RegisterScreenProps {
  userRepository: UserRepository;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ userRepository }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    setMessage('');

    // Validate username
    if (username.trim() === '') {
      setMessage('Tên người dùng không được để trống!');
      setMessageType('error');
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      setMessage('Email không hợp lệ!');
      setMessageType('error');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự!');
      setMessageType('error');
      return;
    }

    try {
      // Create user object
      const createdAt = new Date().toISOString();
      const user: User = {
        id: uuidv4(),
        username: username.trim(),
        email: email.trim(),
        password: password,
        createdAt: createdAt,
        vip: false,
        imageUrl: '',
        activityPoints: 0,
        online: false,
      };

      console.log('Creating user:', {
        id: user.id,
        username: user.username,
        email: user.email,
      });

      // Register user
      const success = await userRepository.registerUser(user);
      console.log('Registration result:', success);

      if (success) {
        setIsSendingOtp(true);

        // Generate and send OTP
        const otp = EmailSender.generateOTP();

        try {
          await EmailSender.sendOTP(
            email,
            otp,
            () => {
              // Success callback
              setMessage('Gửi OTP thành công!');
              setMessageType('success');
              setIsSendingOtp(false);

              // Navigate to OTP screen with state
              navigate('/otp-screen', {
                state: {
                  expectedOtp: otp,
                  userEmail: email,
                },
              });
            },
            (error) => {
              // Failure callback
              console.error('Error sending OTP:', error);
              setMessage(
                `Không thể gửi OTP: ${error.message || 'Lỗi không xác định'}`
              );
              setMessageType('error');
              setIsSendingOtp(false);
            }
          );
        } catch (error) {
          console.error('Error in OTP sending process:', error);
          setMessage('Đã xảy ra lỗi khi gửi OTP');
          setMessageType('error');
          setIsSendingOtp(false);
        }
      } else {
        setMessage('Tài khoản đã tồn tại!');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-green-200 p-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
          Tạo tài khoản
        </h1>

        {/* Username Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên người dùng
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setMessage('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập tên người dùng"
          />
        </div>

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
            <p className="text-red-500 text-xs mt-1">Email không hợp lệ!</p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {passwordVisible ? (
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

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={isSendingOtp}
          className={`w-full py-3 rounded-lg font-medium text-white transition ${
            isSendingOtp
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {isSendingOtp ? 'Đang gửi OTP...' : 'Đăng ký'}
        </button>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`text-sm text-center ${
                messageType === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message}
            </p>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-green-800 hover:text-green-600 font-medium"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;