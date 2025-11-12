import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface OTPScreenProps {
  expectedOtp?: string;
  userEmail?: string;
}

const OTPScreen: React.FC<OTPScreenProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get OTP and email from navigation state
  const expectedOtp = location.state?.expectedOtp || '';
  const userEmail = location.state?.userEmail || '';

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Handle paste of full OTP
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const newOtpValues = value.split('');
      setOtpValues(newOtpValues);
      inputRefs.current[5]?.focus();
      return;
    }

    // Handle single digit input
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Move to next input if digit entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // If current input is empty, move to previous and clear it
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1]?.focus();
      } else if (otpValues[index]) {
        // Clear current input
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    if (/^\d{6}$/.test(pastedData)) {
      const newOtpValues = pastedData.split('');
      setOtpValues(newOtpValues);
      inputRefs.current[5]?.focus();
    }
  };

  const getOtp = (): string => {
    return otpValues.join('');
  };

  const handleVerify = () => {
    const enteredOtp = getOtp();

    if (enteredOtp === expectedOtp) {
      navigate('/login');
    } else {
      setErrorMessage('Mã OTP không đúng');
      // Clear OTP fields
      setOtpValues(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2">Nhập mã OTP</h1>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Vui lòng nhập mã OTP đã được gửi đến email của bạn
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 mb-6">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
        >
          Xác nhận
        </button>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center">{errorMessage}</p>
          </div>
        )}

        {/* Resend OTP Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/register')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Không nhận được mã? Thử lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPScreen;