
import React, { useEffect, useState, useRef } from 'react';
import { Platform, BackHandler, ToastAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import AppNavGraph from './utils/AppNavGraph';
import { SessionManager } from './utils/SessionManager';
import { NavigationRoutes } from './utils/NavigationRoutes';
import { UserRepository, CourseRepository, LessonRepository, ExerciseRepository } from './data/repository';

const App: React.FC = () => {
  const [startDestination, setStartDestination] = useState<string>(NavigationRoutes.LOGIN);
  const [isReady, setIsReady] = useState(false);
  const backPressedTimeRef = useRef<number>(0);

  // Initialize repositories
  const userRepo = new UserRepository();
  const courseRepo = new CourseRepository();
  const lessonRepo = new LessonRepository();
  const exerciseRepo = new ExerciseRepository();

  useEffect(() => {
    initializeApp();
    setupFirebaseMessaging();
    requestNotificationPermissionIfNeeded();

    // Cleanup on unmount
    return () => {
      // Cleanup code if needed
    };
  }, []);

  /**
   * Khởi tạo ứng dụng - kiểm tra trạng thái đăng nhập
   */
  const initializeApp = async () => {
    try {
      // Kiểm tra user đã đăng nhập chưa
      const loggedInUser = await SessionManager.getUserDetails();

      if (loggedInUser) {
        // Cập nhật trạng thái online của người dùng
        await userRepo.updateUserOnlineStatus(loggedInUser.id, true);
        console.log('User online status updated:', loggedInUser.email);

        // Set start destination
        setStartDestination(NavigationRoutes.HOME);
      } else {
        setStartDestination(NavigationRoutes.LOGIN);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setStartDestination(NavigationRoutes.LOGIN);
    } finally {
      setIsReady(true);
    }
  };

  /**
   * Setup Firebase Cloud Messaging
   */
  const setupFirebaseMessaging = async () => {
    try {
      // Subscribe to "all" topic
      await messaging().subscribeToTopic('all');
      console.log('Subscribed to topic: all');

      // Handle foreground messages
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        
        if (remoteMessage.notification) {
          if (Platform.OS === 'android') {
            // Android có thể show notification tự động
            console.log('Notification:', remoteMessage.notification);
          } else {
            // iOS cần show alert thủ công
            Alert.alert(
              remoteMessage.notification.title || 'Thông báo',
              remoteMessage.notification.body || ''
            );
          }
        }
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message received:', remoteMessage);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up Firebase messaging:', error);
    }
  };

  /**
   * Setup OneSignal (removed - using Firebase Messaging instead)
   */

  /**
   * Yêu cầu quyền notification nếu cần (Android 13+)
   */
  const requestNotificationPermissionIfNeeded = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permission is needed - use string for POST_NOTIFICATIONS
        const POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS' as any;
        const permissionCheck = await check(POST_NOTIFICATIONS);
        
        if (permissionCheck !== RESULTS.GRANTED) {
          const permissionResult = await request(POST_NOTIFICATIONS);
          
          if (permissionResult === RESULTS.GRANTED) {
            console.log('Notification permission granted');
          } else {
            console.warn('Notification permission denied');
          }
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    } else if (Platform.OS === 'ios') {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS Notification permission granted:', authStatus);
        } else {
          console.log('iOS Notification permission denied');
        }
      } catch (error) {
        console.error('Error requesting iOS notification permission:', error);
      }
    }
  };

  // Show loading screen while initializing
  if (!isReady) {
    return null; // Hoặc return <SplashScreen />
  }

  return (
    <AppNavGraph
      userRepo={userRepo}
      courseRepo={courseRepo}
      lessonRepo={lessonRepo}
      exerciseRepo={exerciseRepo}
      startDestination={startDestination}
    />
  );
};

export default App;

// ========== NOTES ==========
/*
Các thay đổi so với MainActivity.kt:

1. BackHandler:
   - Trong Kotlin: Xử lý trong BackHandler composable
   - Trong React Native: Cần xử lý trong từng screen hoặc sử dụng useFocusEffect

2. Navigation:
   - Kotlin: Jetpack Navigation Compose
   - React Native: React Navigation
   - Logic tương tự nhưng API khác

3. Permissions:
   - Kotlin: ActivityResultContracts
   - React Native: react-native-permissions

4. Firebase:
   - Cả hai đều dùng Firebase SDK
   - API tương tự, chỉ khác syntax

5. OneSignal:
   - Kotlin: OneSignal.initWithContext()
   - React Native: OneSignal.initialize()

SETUP CẦN THIẾT:

1. Dependencies:
   npm install @react-navigation/native @react-navigation/native-stack
   npm install @react-native-firebase/app @react-native-firebase/messaging
   npm install react-native-onesignal
   npm install react-native-permissions
   npm install @react-native-async-storage/async-storage

2. Android Configuration (android/app/src/main/AndroidManifest.xml):
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   <uses-permission android:name="android.permission.INTERNET" />

3. iOS Configuration (ios/Podfile):
   platform :ios, '13.0'
   pod 'Firebase/Messaging'

4. Firebase Setup:
   - Thêm google-services.json vào android/app/
   - Thêm GoogleService-Info.plist vào ios/

5. OneSignal Setup:
   - Tạo app trên OneSignal dashboard
   - Lấy App ID: 47f96538-4b2b-4933-999a-a9012080d4e9
*/