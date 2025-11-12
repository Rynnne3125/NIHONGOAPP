
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where,
  orderBy,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { 
  User, 
  Course, 
  CourseReview, 
  Lesson, 
  Exercise, 
  Flashcard, 
  UserProgress,
  calculateRank 
} from './types';

const db = getFirestore();
export class UserRepository {
  private currentUser: User | null = null;

  // Hash password using SHA-256
  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  async registerUser(user: User): Promise<boolean> {
    try {
      console.log('Starting registration for username:', user.username, 'email:', user.email);

      // Check for existing username
      const existingUsername = await this.getUserByUsername(user.username);
      if (existingUsername) {
        console.log('Registration failed: Username already exists');
        return false;
      }

      // Check for existing email
      const existingEmail = await this.getUserByEmail(user.email);
      if (existingEmail) {
        console.log('Registration failed: Email already exists');
        return false;
      }

      // Check if user ID is valid
      if (!user.id || user.id.trim() === '') {
        console.error('Registration failed: User ID is blank');
        return false;
      }

      // Hash password and save user
      const hashedUser = { ...user, password: this.hashPassword(user.password) };
      console.log('Saving user with ID:', hashedUser.id);

      await setDoc(doc(db, 'users', hashedUser.id), hashedUser);
      this.currentUser = hashedUser;

      console.log('Registration successful for user:', user.username);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  async loginUserByEmail(email: string, password: string): Promise<User | null> {
    try {
      const hashedPassword = this.hashPassword(password);
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '==', email),
        where('password', '==', hashedPassword)
      );

      const querySnapshot = await getDocs(q);
      const userDoc = querySnapshot.docs[0];

      if (userDoc) {
        const user = userDoc.data() as User;
        this.currentUser = user;
        return user;
      }

      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  private async getUserByUsername(username: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      console.log('Attempting to get user with ID:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const user = userDoc.data() as User;
        console.log('Successfully retrieved user:', user.username);
        return user;
      } else {
        console.error('User document with ID', userId, 'does not exist');
        return null;
      }
    } catch (error) {
      console.error('Error getting user by ID:', userId, error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isVip(): boolean {
    return this.currentUser?.vip === true;
  }

  logout(): void {
    this.currentUser = null;
  }

  async updateUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), user);
      this.currentUser = user;
      console.log('User updated successfully:', user.id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), { online: isOnline });

      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, online: isOnline };
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  async addActivityPoints(userId: string, points: number): Promise<boolean> {
    try {
      console.log('Adding', points, 'points to user', userId);

      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        console.error('Cannot add points: User document with ID', userId, 'does not exist');
        return false;
      }

      const user = userDoc.data() as User;
      const newPoints = user.activityPoints + points;
      const newRank = calculateRank(newPoints);

      console.log('Updating user', userId, ': activityPoints from', user.activityPoints, 'to', newPoints, ', rank to', newRank);

      await updateDoc(doc(db, 'users', userId), {
        activityPoints: newPoints,
        rank: newRank
      });

      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, activityPoints: newPoints, rank: newRank };
      }

      console.log('Successfully added', points, 'points to user', userId);
      return true;
    } catch (error) {
      console.error('Error adding activity points to user', userId, error);
      return false;
    }
  }

  async updateUserProfile(user: User): Promise<boolean> {
    try {
      console.log('Updating user profile:', user.id);

      const currentUserDoc = await getDoc(doc(db, 'users', user.id));
      const currentUserData = currentUserDoc.data() as User;

      if (!currentUserData) {
        console.error('Failed to update profile: User not found');
        return false;
      }

      const updatedUser: User = {
        ...currentUserData,
        username: user.username,
        imageUrl: user.imageUrl,
        jlptLevel: user.jlptLevel,
        studyMonths: user.studyMonths
      };

      await setDoc(doc(db, 'users', user.id), updatedUser);
      this.currentUser = updatedUser;

      console.log('User profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  async updateUserImageUrl(userId: string, imageUrl: string): Promise<boolean> {
    try {
      console.log('Updating user image URL:', userId);

      await updateDoc(doc(db, 'users', userId), { imageUrl });

      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, imageUrl };
      }

      console.log('User image URL updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user image URL:', error);
      return false;
    }
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      console.log('Updating password for user:', userId);

      const hashedPassword = this.hashPassword(newPassword);
      await updateDoc(doc(db, 'users', userId), { password: hashedPassword });

      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, password: hashedPassword };
      }

      console.log('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }
async saveUserProgress(userId: string, userProgress: UserProgress): Promise<void> {
    try {
      const progressRef = doc(db, 'user_progress', userId, 'courses', userProgress.courseId);
      await setDoc(progressRef, userProgress);
      console.log('User progress saved successfully');
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  async updateUserProgress(
    userId: string,
    courseId: string,
    exerciseId: string,
    passed: boolean,
    subLessonId?: string
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'user_progress', userId, 'courses', courseId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const userProgress = progressDoc.data() as UserProgress;

        const updatedCompletedExercises = [...userProgress.completedExercises];
        const updatedPassedExercises = [...userProgress.passedExercises];
        const updatedCompletedSubLessons = [...(userProgress.completedSubLessons || [])];

        if (!updatedCompletedExercises.includes(exerciseId)) {
          updatedCompletedExercises.push(exerciseId);
        }

        if (passed && !updatedPassedExercises.includes(exerciseId)) {
          updatedPassedExercises.push(exerciseId);
        }

        if (subLessonId && !updatedCompletedSubLessons.includes(subLessonId)) {
          updatedCompletedSubLessons.push(subLessonId);
          console.log('Added subLessonId', subLessonId, 'to completedSubLessons');
        }

        const updatedProgress: UserProgress = {
          ...userProgress,
          completedExercises: updatedCompletedExercises,
          passedExercises: updatedPassedExercises,
          completedSubLessons: updatedCompletedSubLessons,
          lastUpdated: Date.now()
        };

        await setDoc(progressRef, updatedProgress);
        console.log('User exercise progress updated with completedSubLessons:', updatedCompletedSubLessons.length);
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  async markLessonAsCompleted(
    userId: string,
    courseId: string,
    lessonId: string,
    totalLessons: number
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'user_progress', userId, 'courses', courseId);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) return;

      const userProgress = progressDoc.data() as UserProgress;
      const completedLessons = [...userProgress.completedLessons];

      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      const updatedProgress: UserProgress = {
        ...userProgress,
        completedLessons,
        progress: completedLessons.length / totalLessons,
        lastUpdated: Date.now()
      };

      console.log('completedLessons.size:', completedLessons.length);
      console.log('totalLessons:', totalLessons);

      await setDoc(progressRef, updatedProgress);
      console.log('Lesson marked as completed');
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  }

  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const progressSnapshot = await getDocs(
        collection(db, 'user_progress', userId, 'courses')
      );
      return progressSnapshot.docs.map(doc => doc.data() as UserProgress);
    } catch (error) {
      console.error('Error getting all user progress:', error);
      return [];
    }
  }

  async getUserProgressForCourse(userId: string, courseId: string): Promise<UserProgress | null> {
    try {
      const progressDoc = await getDoc(
        doc(db, 'user_progress', userId, 'courses', courseId)
      );
      return progressDoc.exists() ? progressDoc.data() as UserProgress : null;
    } catch (error) {
      console.error('Error getting user progress for course:', error);
      return null;
    }
  }
}
