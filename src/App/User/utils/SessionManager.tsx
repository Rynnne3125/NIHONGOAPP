import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './types';
import axios from 'axios';
export class SessionManager {
  private static readonly KEY_IS_LOGGED_IN = 'isLoggedIn';
  private static readonly KEY_USER_DATA = 'userData';

  /**
   * Tạo session đăng nhập cho user
   */
  static async createLoginSession(user: User): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.KEY_IS_LOGGED_IN, 'true'],
        [this.KEY_USER_DATA, JSON.stringify(user)]
      ]);
      console.log('Login session created successfully');
    } catch (error) {
      console.error('Error creating login session:', error);
      throw error;
    }
  }

  /**
   * Xóa session đăng nhập
   */
  static async logoutUser(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.KEY_IS_LOGGED_IN, this.KEY_USER_DATA]);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const isLoggedIn = await AsyncStorage.getItem(this.KEY_IS_LOGGED_IN);
      return isLoggedIn === 'true';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin user từ session
   */
  static async getUserDetails(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.KEY_USER_DATA);
      if (!userJson) return null;
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  }

  /**
   * Cập nhật thông tin user trong session
   */
  static async updateUserDetails(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEY_USER_DATA, JSON.stringify(user));
      console.log('User details updated successfully');
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  }
}
