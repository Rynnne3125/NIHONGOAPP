import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRepository } from '../../../data/repository/UserRepository';
import { SessionManager } from '../../../utils/SessionManager';

interface LoginScreenProps extends NativeStackScreenProps<any, 'login'> {
  userRepo: UserRepository;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route, userRepo }) => {
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
      try {
        const isLoggedIn = await SessionManager.isLoggedIn();

        if (isLoggedIn) {
          const userData = await SessionManager.getUserDetails();
          if (userData) {
            // Navigate to home
            navigation.reset({
              index: 0,
              routes: [{ name: 'main_tabs', params: { userEmail: userData.email } }],
            });
          } else {
            setIsCheckingSession(false);
          }
        } else {
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsCheckingSession(false);
      }
    };

    const timer = setTimeout(checkSession, 500);
    return () => clearTimeout(timer);
  }, [navigation]);

  // If navigated from registration with OTP verified, prefill email and show success message
  useEffect(() => {
    try {
      const params = route?.params as any;
      if (params?.registeredSuccess) {
        const regEmail = params?.registeredEmail as string | undefined;
        if (regEmail) setEmail(regEmail);
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch (e) {
      // ignore
    }
  }, [route?.params]);

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

      console.log('[LoginScreen] Starting login attempt for email:', email);

      // Attempt login
      const user = await userRepo.loginUserByEmail(email, password);

      console.log('[LoginScreen] loginUserByEmail result:', user);

      if (user) {
        console.log('[LoginScreen] User retrieved successfully:', {
          id: user.id,
          email: user.email,
          username: user.username,
          admin: (user as any).admin,
          hasId: !!user.id,
          hasEmail: !!user.email,
        });

        // Update user online status
        console.log('[LoginScreen] Updating user online status to true');
        await userRepo.updateUserOnlineStatus(user.id, true);

        // Create session using SessionManager
        console.log('[LoginScreen] Creating login session');
        await SessionManager.createLoginSession(user);

        console.log('[LoginScreen] Login successful for user:', user.email);

        // Navigate to main_tabs with userEmail param
        navigation.reset({
          index: 0,
          routes: [{ name: 'main_tabs', params: { userEmail: user.email } }],
        });
      } else {
        setMessage('Sai email hoặc mật khẩu!');
        console.error('[LoginScreen] Login failed: Invalid credentials - user is null/undefined');
      }
    } catch (error) {
      console.error('[LoginScreen] Login error:', error);
      console.error('[LoginScreen] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading screen while checking session
  if (isCheckingSession) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.centeredInner}>
          <Image
            source={{ uri: 'https://drive.google.com/uc?export=download&id=1QiO2eVlHxojSL5QGsetoQUhBT5aO7Yvm' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>NIHONGO</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Đăng nhập</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(text) => { setEmail(text); setMessage(''); }}
                placeholder="Nhập email của bạn"
                style={[styles.input, email && !isValidEmail(email) ? styles.inputError : undefined]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {email && !isValidEmail(email) && (
                <Text style={styles.errorText}>Email không hợp lệ</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={(text) => { setPassword(text); setMessage(''); }}
                  placeholder="Nhập mật khẩu"
                  secureTextEntry={!isPasswordVisible}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.showButton}>
                  <Text style={styles.showButtonText}>{isPasswordVisible ? 'Ẩn' : 'Hiện'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={[styles.loginButton, isLoading ? styles.buttonDisabled : undefined]}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Đăng nhập</Text>}
            </TouchableOpacity>

            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => navigation.navigate('register')}>
                <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('admin_login')}>
                <Text style={styles.smallLink}>Đăng nhập với tư cách Admin</Text>
              </TouchableOpacity>
            </View>

            {message ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{message}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#ecfdf5' },
  centered: { flex: 1, backgroundColor: '#fff' },
  centeredInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 160, height: 160, marginBottom: 12 },
  appTitle: { fontSize: 36, fontWeight: '700', color: '#16a34a' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#065f46', textAlign: 'center', marginBottom: 18 },
  field: { marginBottom: 12 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#fff' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 6 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  showButton: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 6 },
  showButtonText: { color: '#065f46', fontWeight: '600' },
  loginButton: { backgroundColor: '#065f46', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  linksRow: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#065f46', fontWeight: '600' },
  smallLink: { color: '#6b7280', marginTop: 6 },
  errorBox: { marginTop: 12, backgroundColor: '#fff7f7', borderColor: '#fee2e2', borderWidth: 1, padding: 10, borderRadius: 8 },
  errorBoxText: { color: '#b91c1c', textAlign: 'center' },
});

export default LoginScreen;