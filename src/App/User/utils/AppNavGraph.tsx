// AppNavGraph.tsx - Navigation graph cho ứng dụng

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

// Import repositories
import { UserRepository, CourseRepository, LessonRepository, ExerciseRepository } from './repositories';
import { NavigationRoutes } from './NavigationRoutes';
import { Exercise } from './types';

// Import screens (bạn cần tạo các file screen này)
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OTPScreen from './screens/OTPScreen';
import HomeScreen from './screens/HomeScreen';
import CoursesScreen from './screens/CoursesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CommunityScreen from './screens/CommunityScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import LessonsScreen from './screens/LessonsScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import QuizScreen from './screens/QuizScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import GroupChatScreen from './screens/GroupChatScreen';
import PrivateChatScreen from './screens/PrivateChatScreen';
import DiscussionChatScreen from './screens/DiscussionChatScreen';
import CreateDiscussionScreen from './screens/CreateDiscussionScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import MainPage from './screens/MainPage';
import CoursePage from './screens/CoursePage';
import VipRequestPage from './screens/VipRequestPage';

// Define param list
export type RootStackParamList = {
  [NavigationRoutes.LOGIN]: undefined;
  [NavigationRoutes.REGISTER]: undefined;
  otp_screen: { expectedOtp: string; user_email: string };
  'home/{user_email}': { user_email: string };
  'courses/{user_email}': { user_email: string };
  'profile/{user_email}': { user_email: string };
  'community/{user_email}': { user_email: string; tab?: number };
  'courses/{courseId}/{user_email}': { courseId: string; user_email: string };
  'lessons/{courseId}/{user_email}': { courseId: string; user_email: string };
  'exercise/{courseId}/{lessonId}/{sublessonId}/{user_email}': {
    courseId: string;
    lessonId: string;
    sublessonId: string;
    user_email: string;
  };
  'quiz_screen/{user_email}/{courseId}/{lessonId}': {
    user_email: string;
    courseId: string;
    lessonId: string;
    quizList: Exercise[];
  };
  'vocabulary/{user_email}': { user_email: string; tab?: string };
  'group_chat/{groupId}/{user_email}': { groupId: string; user_email: string };
  'private_chat/{partnerId}/{user_email}': { partnerId: string; user_email: string };
  'discussion_chat/{discussionId}/{user_email}': { discussionId: string; user_email: string };
  'create_discussion/{user_email}': { user_email: string };
  course_page: undefined;
  vipRequestPage: undefined;
  admin_login: undefined;
  MainPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavGraphProps {
  userRepo: UserRepository;
  courseRepo: CourseRepository;
  lessonRepo: LessonRepository;
  exerciseRepo: ExerciseRepository;
  startDestination?: string;
}

const AppNavGraph: React.FC<AppNavGraphProps> = ({
  userRepo,
  courseRepo,
  lessonRepo,
  exerciseRepo,
  startDestination = NavigationRoutes.LOGIN
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={startDestination as any}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name={NavigationRoutes.LOGIN}>
          {(props) => <LoginScreen {...props} userRepo={userRepo} />}
        </Stack.Screen>

        <Stack.Screen name={NavigationRoutes.REGISTER}>
          {(props) => <RegisterScreen {...props} userRepo={userRepo} />}
        </Stack.Screen>

        <Stack.Screen
          name="otp_screen"
          component={OTPScreen}
        />

        {/* Bottom Nav Screens */}
        <Stack.Screen name="home/{user_email}">
          {(props) => (
            <HomeScreen
              {...props}
              userRepo={userRepo}
              courseRepo={courseRepo}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="courses/{user_email}">
          {(props) => (
            <CoursesScreen
              {...props}
              courseRepo={courseRepo}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="profile/{user_email}">
          {(props) => (
            <ProfileScreen
              {...props}
              userRepository={userRepo}
              courseRepository={courseRepo}
              onSignOut={async () => {
                const userEmail = props.route.params?.user_email;
                if (userEmail) {
                  const currentUser = await userRepo.getUserByEmail(userEmail);
                  if (currentUser) {
                    try {
                      await messaging().unsubscribeFromTopic(currentUser.id);
                      console.log('Unsubscribed from topic');
                    } catch (error) {
                      console.log('Unsubscription failed', error);
                    }
                  }
                }
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: NavigationRoutes.LOGIN }],
                });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="community/{user_email}">
          {(props) => (
            <CommunityScreen
              {...props}
              userRepo={userRepo}
            />
          )}
        </Stack.Screen>

        {/* Course Screens */}
        <Stack.Screen name="courses/{courseId}/{user_email}">
          {(props) => {
            const courseId = props.route.params?.courseId;
            if (!courseId) {
              return <InvalidCourseScreen />;
            }
            return (
              <CourseDetailScreen
                {...props}
                courseRepo={courseRepo}
                userRepo={userRepo}
                lessonRepo={lessonRepo}
              />
            );
          }}
        </Stack.Screen>

        <Stack.Screen name="lessons/{courseId}/{user_email}">
          {(props) => (
            <LessonsScreen
              {...props}
              courseRepo={courseRepo}
              lessonRepo={lessonRepo}
              userRepo={userRepo}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="exercise/{courseId}/{lessonId}/{sublessonId}/{user_email}">
          {(props) => {
            const { lessonId, sublessonId } = props.route.params || {};
            if (!lessonId || !sublessonId) {
              return <Text>Không tìm thấy bài tập, vui lòng thử lại.</Text>;
            }
            return (
              <ExerciseScreen
                {...props}
                exerciseRepo={exerciseRepo}
              />
            );
          }}
        </Stack.Screen>

        <Stack.Screen
          name="quiz_screen/{user_email}/{courseId}/{lessonId}"
          component={QuizScreen}
        />

        <Stack.Screen
          name="vocabulary/{user_email}"
          component={FlashcardScreen}
        />

        {/* Chat Screens */}
        <Stack.Screen name="group_chat/{groupId}/{user_email}">
          {(props) => (
            <GroupChatScreen
              {...props}
              userRepository={userRepo}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="private_chat/{partnerId}/{user_email}">
          {(props) => (
            <PrivateChatScreen
              {...props}
              userRepository={userRepo}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="discussion_chat/{discussionId}/{user_email}">
          {(props) => (
            <DiscussionChatScreen
              {...props}
              userRepository={userRepo}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="create_discussion/{user_email}">
          {(props) => (
            <CreateDiscussionScreen
              {...props}
              userRepository={userRepo}
            />
          )}
        </Stack.Screen>

        {/* Admin Screens */}
        <Stack.Screen name="course_page" component={CoursePage} />
        <Stack.Screen name="vipRequestPage" component={VipRequestPage} />
        <Stack.Screen name="admin_login" component={AdminLoginScreen} />
        <Stack.Screen name="MainPage" component={MainPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const InvalidCourseScreen: React.FC = () => {
  return <Text>Invalid course ID.</Text>;
};

export default AppNavGraph;