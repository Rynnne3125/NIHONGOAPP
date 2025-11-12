/**
 * Firebase configuration using React Native Firebase SDK
 * Extracted from /android/app/google-services.json
 */

import { initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Firebase config extracted from google-services.json
const firebaseConfig = {
  projectId: 'nihongo-ae96a',
  databaseURL: 'https://nihongo-ae96a-default-rtdb.firebaseio.com',
  storageBucket: 'nihongo-ae96a.firebasestorage.app',
  messagingSenderId: '72338859954',
  appId: '1:72338859954:android:f7cac782a6bab63f8466ab',
};

/**
 * Initialize Firebase App
 * Note: In React Native, Firebase initialization is handled by @react-native-firebase/app
 * The android/google-services.json file is used by the Android build process
 */
export function initializeFirebaseApp() {
  try {
    // @react-native-firebase automatically initializes from google-services.json
    console.log('Firebase initialized with config:', {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

/**
 * Get Firestore instance
 */
export function getFirestoreDb() {
  return firestore();
}

/**
 * Get Firebase Messaging instance
 */
export function getMessagingInstance() {
  return messaging();
}

/**
 * Export Firebase config for reference
 */
export { firebaseConfig };
