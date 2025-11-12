import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

interface OTPScreenProps extends NativeStackScreenProps<any, 'otp_screen'> {}

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { expectedOtp = '', userEmail = '' } = route.params || {};
  
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newValues = [...otpValues];
    
    // Handle paste (if value length is 6, split it)
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setOtpValues(value.split(''));
      return;
    }
    
    // Handle single digit
    if (value.length <= 1) {
      newValues[index] = value;
      setOtpValues(newValues);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpValues.join('');
    
    if (enteredOtp.length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số OTP!');
      return;
    }

    setIsLoading(true);
    
    try {
      if (enteredOtp === expectedOtp) {
        setErrorMessage('');
        // After successful verification of registration OTP,
        // go back to the login screen and prefill email with a success flag
        navigation.reset({
          index: 0,
          routes: [
            { name: 'login', params: { registeredEmail: userEmail, registeredSuccess: true } }, 
          ],
        });
      } else {
        setErrorMessage('OTP không chính xác! Vui lòng thử lại.');
      }
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      // Logic to resend OTP would go here
      setErrorMessage('');
      setOtpValues(['', '', '', '', '', '']);
      // Show success message
    } catch (error) {
      setErrorMessage('Không thể gửi lại OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>Xác thực OTP</Text>
          <Text style={styles.subtitle}>
            Nhập mã OTP đã được gửi đến {userEmail}
          </Text>
        </View>

        {/* OTP Input Container */}
        <View style={styles.otpContainer}>
          <View style={styles.otpInputsRow}>
            {otpValues.map((value, index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={6}
                value={value}
                onChangeText={(text) => handleOtpChange(index, text)}
                placeholder="0"
                placeholderTextColor="#ccc"
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isLoading && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.verifyButtonText}>Đang xác thực...</Text>
              </>
            ) : (
              <Text style={styles.verifyButtonText}>Xác thực OTP</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Không nhận được OTP? </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isLoading}
            >
              <Text style={styles.resendLink}>Gửi lại</Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  otpContainer: {
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
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: '15%',
    height: 50,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#15803d',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OTPScreen;