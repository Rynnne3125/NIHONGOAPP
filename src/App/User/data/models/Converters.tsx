import firestore from '@react-native-firebase/firestore';
export const fromStringList = (list?: string[] | null): string => {
  return list?.join(',') ?? '';
};

export const toStringList = (data?: string | null): string[] => {
  return data?.split(',').map(s => s.trim()).filter(s => s.length > 0) ?? [];
};