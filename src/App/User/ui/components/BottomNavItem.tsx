// BottomNavItem.ts - Định nghĩa các item cho Bottom Navigation

export interface NavItem {
  route: string;
  label: string;
  icon: string;
  iconFocused: string;
}

export const BottomNavItem = {
  Home: {
    route: 'home',
    label: 'Trang chủ',
    icon: 'home-outline',
    iconFocused: 'home'
  },
  Courses: {
    route: 'courses',
    label: 'Khóa học',
    icon: 'book-outline',
    iconFocused: 'book'
  },
  Community: {
    route: 'community',
    label: 'Cộng đồng',
    icon: 'account-group-outline',
    iconFocused: 'account-group'
  },
  Profile: {
    route: 'profile',
    label: 'Hồ sơ',
    icon: 'account-outline',
    iconFocused: 'account'
  }
} as const;