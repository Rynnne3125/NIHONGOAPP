
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
export class CourseRepository {
  async getAllCourses(): Promise<Course[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      return snapshot.docs.map(doc => doc.data() as Course);
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  async insertCourse(course: Course): Promise<void> {
    try {
      const courseId = course.id || doc(collection(db, 'courses')).id;
      const courseWithId = { ...course, id: courseId };
      await setDoc(doc(db, 'courses', courseId), courseWithId);
    } catch (error) {
      console.error('Error inserting course:', error);
    }
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      return courseDoc.exists() ? courseDoc.data() as Course : null;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      return null;
    }
  }

  async getCourseReviews(courseId: string): Promise<CourseReview[]> {
    try {
      const q = query(
        collection(db, 'courseReviews'),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as CourseReview);
    } catch (error) {
      console.error('Error getting course reviews:', error);
      return [];
    }
  }

  async getUserReviewForCourse(courseId: string, userId: string): Promise<CourseReview | null> {
    try {
      const q = query(
        collection(db, 'courseReviews'),
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : snapshot.docs[0].data() as CourseReview;
    } catch (error) {
      console.error('Error getting user review:', error);
      return null;
    }
  }

  async addCourseReview(review: CourseReview): Promise<boolean> {
    try {
      const reviewRef = doc(collection(db, 'courseReviews'));
      const reviewWithId = { ...review, id: reviewRef.id };

      await setDoc(reviewRef, reviewWithId);
      await this.updateCourseRating(review.courseId);
      await updateDoc(doc(db, 'courses', review.courseId), {
        reviews: increment(1)
      });

      return true;
    } catch (error) {
      console.error('Error adding course review:', error);
      return false;
    }
  }

  async updateCourseReview(review: CourseReview): Promise<boolean> {
    try {
      await setDoc(doc(db, 'courseReviews', review.id), review);
      await this.updateCourseRating(review.courseId);
      return true;
    } catch (error) {
      console.error('Error updating course review:', error);
      return false;
    }
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'courseReviews'),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data() as CourseReview);

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      await updateDoc(doc(db, 'courses', courseId), { rating: averageRating });
    } catch (error) {
      console.error('Error updating course rating:', error);
    }
  }

  async isCourseLikedByUser(courseId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'courseLikes'),
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if course is liked:', error);
      return false;
    }
  }

  async likeCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const likeData = {
        courseId,
        userId,
        timestamp: serverTimestamp()
      };
      await setDoc(doc(collection(db, 'courseLikes')), likeData);
      await updateDoc(doc(db, 'courses', courseId), { likes: increment(1) });
      return true;
    } catch (error) {
      console.error('Error liking course:', error);
      return false;
    }
  }

  async unlikeCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'courseLikes'),
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'courseLikes', snapshot.docs[0].id));
        await updateDoc(doc(db, 'courses', courseId), { likes: increment(-1) });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unliking course:', error);
      return false;
    }
  }

  async dislikeCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const dislikeData = {
        courseId,
        userId,
        timestamp: serverTimestamp()
      };
      await setDoc(doc(collection(db, 'courseDislikes')), dislikeData);
      await updateDoc(doc(db, 'courses', courseId), { dislikes: increment(1) });
      return true;
    } catch (error) {
      console.error('Error disliking course:', error);
      return false;
    }
  }

  async removeDislike(courseId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'courseDislikes'),
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'courseDislikes', snapshot.docs[0].id));
        await updateDoc(doc(db, 'courses', courseId), { dislikes: increment(-1) });
      }
      return true;
    } catch (error) {
      console.error('Error removing dislike:', error);
      return false;
    }
  }

  async isCoursedislikedByUser(courseId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'courseDislikes'),
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if course is disliked:', error);
      return false;
    }
  }
}
