import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
  // Generate simple ID
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
import { User } from '../../../data/models/User';
import { UserRepository } from '../../../data/repository/UserRepository';
import { EmailSender } from '../../../utils/EmailSender';

interface RegisterScreenProps extends NativeStackScreenProps<any, 'register'> {
  userRepository: UserRepository;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, userRepository }) => {
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
          id: generateId(),
        username: username.trim(),
        email: email.trim(),
        password: password,
        createdAt: createdAt,
        vip: false,
        imageUrl: '',
        activityPoints: 0,
        online: false,
        isLoggedIn: false,
        rank: 'Tân binh',
        partners: [],
        admin: false,
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
        console.log('[RegisterScreen] User registered successfully, now sending OTP');

        // Generate and send OTP
        const otp = EmailSender.generateOTP();
        console.log('[RegisterScreen] Generated OTP:', otp);

        try {
          console.log('[RegisterScreen] Starting OTP send process...');
          await EmailSender.sendOTP(
            email,
            otp,
            () => {
              // Success callback
              console.log('[RegisterScreen] ✅ OTP sent successfully');
              setMessage('Gửi OTP thành công!');
              setMessageType('success');
              setIsSendingOtp(false);

              // Navigate to OTP screen with params
              console.log('[RegisterScreen] Navigating to OTP screen with email:', email);
              navigation.navigate('otp_screen', {
                expectedOtp: otp,
                userEmail: email,
              });
            },
            (error) => {
              // Failure callback
              console.error('[RegisterScreen] ❌ Error sending OTP:', error);
              const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
              setMessage(
                `Không thể gửi OTP: ${errorMessage}`
              );
              setMessageType('error');
              setIsSendingOtp(false);
            }
          );
        } catch (error) {
          console.error('[RegisterScreen] Error in OTP sending process:', error);
          setMessage('Đã xảy ra lỗi khi gửi OTP');
          setMessageType('error');
          setIsSendingOtp(false);
        }
      } else {
        setMessage('Tài khoản đã tồn tại!');
        setMessageType('error');
        console.log('[RegisterScreen] Registration failed: Account already exists');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      setMessageType('error');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên người dùng</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên người dùng"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setMessage('');
              }}
              placeholderTextColor="#999"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                email && !isValidEmail(email) && styles.inputError,
              ]}
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setMessage('');
              }}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            {email && !isValidEmail(email) && (
              <Text style={styles.errorText}>Email không hợp lệ!</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setMessage('');
                }}
                secureTextEntry={!passwordVisible}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeButtonText}>
                  {passwordVisible ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              isSendingOtp && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isSendingOtp}
          >
            {isSendingOtp ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.registerButtonText}>Đang gửi OTP...</Text>
              </>
            ) : (
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          {/* Message Display */}
          {message && (
            <View
              style={[
                styles.messageContainer,
                messageType === 'success'
                  ? styles.messageSuccess
                  : styles.messageError,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  messageType === 'success'
                    ? styles.messageTextSuccess
                    : styles.messageTextError,
                ]}
              >
                {message}
              </Text>
            </View>
          )}

          {/* (debug banner removed) */}
          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 8,
  },
  eyeButtonText: {
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#15803d',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  messageError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  messageTextSuccess: {
    color: '#166534',
  },
  messageTextError: {
    color: '#b91c1c',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  debugBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#fde68a',
    alignItems: 'center',
  },
  debugLabel: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 6,
    fontWeight: '600',
  },
  debugOtp: {
    fontSize: 20,
    fontWeight: '700',
    color: '#b45309',
    letterSpacing: 4,
  },
});

export default RegisterScreen;