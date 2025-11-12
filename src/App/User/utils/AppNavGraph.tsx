// AppNavGraph.tsx - Navigation graph with Bottom Tab Navigator

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

// Import repositories
import { UserRepository, CourseRepository, LessonRepository, ExerciseRepository } from '../data/repository/index';
import { NavigationRoutes } from './NavigationRoutes';
import { BottomNavItem } from '../ui/components/BottomNavItem';
import { Exercise } from '../data/models/Exercise';

// Import screens - Login screens
import LoginScreen from '../ui/screens/login/LoginScreen';
import RegisterScreen from '../ui/screens/login/RegisterScreen';
import OTPScreen from '../ui/screens/login/OTPScreen';

// Import screens - Homepage screens
import HomeScreen from '../ui/screens/homepage/HomeScreen';
import CoursesScreen from '../ui/screens/homepage/CoursesScreen';
import ProfileScreen from '../ui/screens/homepage/ProfileScreen';
import CommunityScreen from '../ui/screens/homepage/CommunityScreenFull';
import LessonsScreen from '../ui/screens/homepage/LessonsScreen';
import ExerciseScreen from '../ui/screens/homepage/ExerciseScreen';
import QuizScreen from '../ui/screens/homepage/QuizScreen';
import FlashcardScreen from '../ui/screens/homepage/FlashcardScreen';

// Import screens - Chat screens
import GroupChatScreen from '../ui/screens/chat/GroupChatScreen';
import PrivateChatScreen from '../ui/screens/chat/PrivateChatScreen';
import DiscussionChatScreen from '../ui/screens/chat/DiscussionChatScreen';
import CreateDiscussionScreen from '../ui/screens/chat/CreateDiscussionScreen';

// Import screens - Admin screens
import AdminLoginScreen from '../../Admin/Admin/AdminLoginScreen';
import MainPage from '../../Admin/Admin/ui/MainPage';
import CoursePage from '../../Admin/Admin/ui/CoursePage';
import VipRequestPage from '../../Admin/ui/VipRequestPage';

// Define param list
export type RootStackParamList = {
  [NavigationRoutes.LOGIN]: undefined;
  [NavigationRoutes.REGISTER]: undefined;
  otp_screen: { expectedOtp: string; userEmail: string };
  main_tabs: { userEmail: string };
  'home/{userEmail}': { userEmail: string };
  'courses/{userEmail}': { userEmail: string };
  'profile/{userEmail}': { userEmail: string };
  'community/{userEmail}': { userEmail: string; tab?: number };
  'courses/{courseId}/{userEmail}': { courseId: string; userEmail: string };
  'lessons/{courseId}/{userEmail}': { courseId: string; userEmail: string };
  'exercise/{courseId}/{lessonId}/{sublessonId}/{userEmail}': {
    courseId: string;
    lessonId: string;
    sublessonId: string;
    userEmail: string;
  };
  'quiz_screen/{userEmail}/{courseId}/{lessonId}': {
    userEmail: string;
    courseId: string;
    lessonId: string;
    quizList: Exercise[];
  };
  'vocabulary/{userEmail}': { userEmail: string; tab?: string };
  'group_chat/{groupId}/{userEmail}': { groupId: string; userEmail: string };
  'private_chat/{partnerUserId}/{userEmail}': { partnerUserId: string; userEmail: string };
  'discussion_chat/{discussionId}/{userEmail}': { discussionId: string; userEmail: string };
  'create_discussion/{userEmail}': { userEmail: string };
  course_page: undefined;
  vipRequestPage: undefined;
  admin_login: undefined;
  MainPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

interface AppNavGraphProps {
  userRepo: UserRepository;
  courseRepo: CourseRepository;
  lessonRepo: LessonRepository;
  exerciseRepo: ExerciseRepository;
  startDestination?: string;
  initialUserEmail?: string;
}

/**
 * Bottom Tab Navigator - Main app screens (Home, Courses, Community, Profile)
 */
const BottomTabNavigator: React.FC<{
  userRepo: UserRepository;
  courseRepo: CourseRepository;
  lessonRepo: LessonRepository;
  exerciseRepo: ExerciseRepository;
  userEmail: string;
}> = ({ userRepo, courseRepo, lessonRepo, exerciseRepo, userEmail }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name={BottomNavItem.Home.route as any}
        options={{
          tabBarLabel: BottomNavItem.Home.label,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      >
        {(props) => (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="home/{userEmail}"
              options={{ title: 'Trang chủ' }}
            >
              {(innerProps) => (
                <HomeScreen
                  {...innerProps}
                  route={{ ...innerProps.route, params: { userEmail } }}
                  userRepo={userRepo}
                  courseRepo={courseRepo}
                />
              )}
            </Stack.Screen>
            {/* Nested screens from Home tab */}
            <Stack.Screen
              name="courses/{courseId}/{userEmail}"
              options={{ title: 'Chi tiết khóa học' }}
            >
              {(innerProps) => (
                <LessonsScreen
                  {...innerProps}
                  courseRepo={courseRepo}
                  lessonRepo={lessonRepo}
                  userRepo={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="lessons/{courseId}/{userEmail}"
              options={{ title: 'Bài học' }}
            >
              {(innerProps) => (
                <LessonsScreen
                  {...innerProps}
                  courseRepo={courseRepo}
                  lessonRepo={lessonRepo}
                  userRepo={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="exercise/{courseId}/{lessonId}/{sublessonId}/{userEmail}"
              options={{ title: 'Bài tập' }}
            >
              {(innerProps) => (
                <ExerciseScreen {...innerProps} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="quiz_screen/{userEmail}/{courseId}/{lessonId}"
              options={{ title: 'Quiz' }}
            >
              {(innerProps) => (
                <QuizScreen {...innerProps} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="vocabulary/{userEmail}"
              options={{ title: 'Flashcard' }}
            >
              {(innerProps) => (
                <FlashcardScreen {...innerProps} />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>

      {/* Courses Tab */}
      <Tab.Screen
        name={BottomNavItem.Courses.route as any}
        options={{
          tabBarLabel: BottomNavItem.Courses.label,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📚</Text>,
        }}
      >
        {(props) => (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="courses/{userEmail}"
              options={{ title: 'Khóa học' }}
            >
              {(innerProps) => (
                <CoursesScreen
                  {...innerProps}
                  route={{ ...innerProps.route, params: { userEmail } }}
                  courseRepo={courseRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="courses/{courseId}/{userEmail}"
              options={{ title: 'Chi tiết khóa học' }}
            >
              {(innerProps) => (
                <LessonsScreen
                  {...innerProps}
                  courseRepo={courseRepo}
                  lessonRepo={lessonRepo}
                  userRepo={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="lessons/{courseId}/{userEmail}"
              options={{ title: 'Bài học' }}
            >
              {(innerProps) => (
                <LessonsScreen
                  {...innerProps}
                  courseRepo={courseRepo}
                  lessonRepo={lessonRepo}
                  userRepo={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="exercise/{courseId}/{lessonId}/{sublessonId}/{userEmail}"
              options={{ title: 'Bài tập' }}
            >
              {(innerProps) => (
                <ExerciseScreen {...innerProps} />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>

      {/* Community Tab */}
      <Tab.Screen
        name={BottomNavItem.Community.route as any}
        options={{
          tabBarLabel: BottomNavItem.Community.label,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      >
        {(props) => (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="community/{userEmail}"
              options={{ title: 'Cộng đồng' }}
            >
              {(innerProps) => (
                <CommunityScreen
                  {...innerProps}
                  route={{ ...innerProps.route, params: { userEmail } }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="group_chat/{groupId}/{userEmail}"
              options={{ title: 'Nhóm chat' }}
            >
              {(innerProps) => (
                <GroupChatScreen
                  {...innerProps}
                  userRepository={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="private_chat/{partnerUserId}/{userEmail}"
              options={{ title: 'Chat riêng' }}
            >
              {(innerProps) => (
                <PrivateChatScreen
                  {...innerProps}
                  userRepository={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="discussion_chat/{discussionId}/{userEmail}"
              options={{ title: 'Thảo luận' }}
            >
              {(innerProps) => (
                <DiscussionChatScreen
                  {...innerProps}
                  userRepository={userRepo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="create_discussion/{userEmail}"
              options={{ title: 'Tạo thảo luận' }}
            >
              {(innerProps) => (
                <CreateDiscussionScreen
                  {...innerProps}
                  userRepository={userRepo}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>

      {/* Profile Tab */}
      <Tab.Screen
        name={BottomNavItem.Profile.route as any}
        options={{
          tabBarLabel: BottomNavItem.Profile.label,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      >
        {(props) => (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="profile/{userEmail}"
              options={{ title: 'Hồ sơ' }}
            >
              {(innerProps) => (
                <ProfileScreen
                  {...innerProps}
                  route={{ ...innerProps.route, params: { userEmail } }}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

/**
 * Main App Navigator
 */
const AppNavGraph: React.FC<AppNavGraphProps> = ({
  userRepo,
  courseRepo,
  lessonRepo,
  exerciseRepo,
  startDestination = NavigationRoutes.LOGIN,
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
        <Stack.Screen
          name={NavigationRoutes.LOGIN}
          options={{ title: 'Đăng nhập' }}
        >
          {(props) => <LoginScreen {...props} userRepo={userRepo} />}
        </Stack.Screen>

        <Stack.Screen
          name={NavigationRoutes.REGISTER}
          options={{ title: 'Đăng ký' }}
        >
          {(props) => <RegisterScreen {...props} userRepository={userRepo} />}
        </Stack.Screen>

        <Stack.Screen
          name="otp_screen"
          options={{ title: 'Xác thực OTP' }}
        >
          {(props) => <OTPScreen {...props} />}
        </Stack.Screen>

        {/* Bottom Tab Navigator - Main App */}
        <Stack.Screen
          name="main_tabs"
          options={{ title: 'Main' }}
        >
          {(props) => {
            const userEmail = props.route.params?.userEmail || '';
            return (
              <BottomTabNavigator
                userEmail={userEmail}
                userRepo={userRepo}
                courseRepo={courseRepo}
                lessonRepo={lessonRepo}
                exerciseRepo={exerciseRepo}
              />
            );
          }}
        </Stack.Screen>

        {/* Admin Screens */}
        <Stack.Screen name="course_page" options={{ title: 'Quản lý khóa học' }}>
          {(props) => <CoursePage {...props} />}
        </Stack.Screen>

        <Stack.Screen name="vipRequestPage" options={{ title: 'Yêu cầu VIP' }}>
          {(props) => <VipRequestPage {...props} navController={props.navigation} />}
        </Stack.Screen>

        <Stack.Screen name="admin_login" options={{ title: 'Đăng nhập Admin' }}>
          {(props) => <AdminLoginScreen {...props} navController={props.navigation} />}
        </Stack.Screen>

        <Stack.Screen name="MainPage" options={{ title: 'Trang Admin' }}>
          {(props) => <MainPage {...props} navController={props.navigation} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const InvalidCourseScreen: React.FC = () => {
  return <Text>Invalid course ID.</Text>;
};

export default AppNavGraph;
