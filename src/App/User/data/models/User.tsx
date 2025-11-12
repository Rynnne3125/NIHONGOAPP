import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  imageUrl: string;
  createdAt: string;
  vip: boolean;
  isLoggedIn: boolean;
  activityPoints: number;
  rank: string;
  jlptLevel?: number | null;
  studyMonths?: number | null;
  online: boolean;
  partners: string[];
  admin: boolean;
}
export const calculateRank = (activityPoints: number): string => {
  if (activityPoints >= 1000) return "Bậc thầy";
  if (activityPoints >= 750) return "Chuyên gia";
  if (activityPoints >= 500) return "Cao cấp";
  if (activityPoints >= 300) return "Trung cấp";
  if (activityPoints >= 150) return "Sơ cấp";
  if (activityPoints >= 50) return "Người mới";
  return "Tân binh";
};

export const updateUserOnlineStatus = (user: User, isOnline: boolean): User => {
  return { ...user, online: isOnline };
};

export const addPartner = (user: User, partnerId: string): User => {
  if (user.partners.includes(partnerId)) return user;
  return { ...user, partners: [...user.partners, partnerId] };
};

export const removePartner = (user: User, partnerId: string): User => {
  if (!user.partners.includes(partnerId)) return user;
  return { ...user, partners: user.partners.filter(p => p !== partnerId) };
};

export const addActivityPoints = (user: User, points: number): User => {
  const newPoints = user.activityPoints + points;
  const newRank = calculateRank(newPoints);
  return { ...user, activityPoints: newPoints, rank: newRank };
};