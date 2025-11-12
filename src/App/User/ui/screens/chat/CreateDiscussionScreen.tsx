import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import firestore, {
  collection,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { User } from '../../../data/models/User';
import { Discussion } from '../../../data/models';
import { UserRepository } from '../../../data/repository/UserRepository';

const db = firestore();

interface CreateDiscussionScreenProps extends NativeStackScreenProps<any, 'create_discussion/{userEmail}'> {
  userEmail?: string;
  userRepository?: UserRepository;
}

const CreateDiscussionScreen: React.FC<CreateDiscussionScreenProps> = ({
  navigation,
  route,
  userEmail: passedEmail,
  userRepository: passedRepository,
}) => {
  const userEmail = route.params?.userEmail || passedEmail || '';
  const userRepository = passedRepository;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      if (!userRepository) return;
      try {
        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadUser();
  }, [userEmail, userRepository]);

  const handleCreateDiscussion = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!currentUser || !userRepository) {
      Alert.alert('Lỗi', 'Không thể xác định người dùng hiện tại');
      return;
    }

    setIsLoading(true);

    try {
      const tagList = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const newDiscussion: Omit<Discussion, 'id'> = {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorImageUrl: currentUser.imageUrl,
        tags: tagList,
        createdAt: Date.now(),
        commentCount: 0,
      };

      const docRef = await addDoc(
        collection(db, 'discussions'),
        newDiscussion
      );

      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 5,
      };
      await userRepository.updateUser(updatedUser);

      Alert.alert('Thành công', 'Thảo luận đã được tạo!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('discussion_chat/{discussionId}/{userEmail}', {
              discussionId: docRef.id,
              userEmail,
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating discussion:', error);
      Alert.alert('Lỗi', `Lỗi tạo thảo luận: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tạo thảo luận mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}
      >
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề thảo luận..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholderTextColor="#999"
          />
          <Text style={styles.charCount}>{title.length}/100</Text>

          <Text style={styles.label}>Nội dung *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập nội dung thảo luận..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>

          <Text style={styles.label}>Tags (cách nhau bằng dấu phẩy)</Text>
          <TextInput
            style={styles.input}
            placeholder="ví dụ: Python, Web, React"
            value={tags}
            onChangeText={setTags}
            maxLength={100}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateDiscussion}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Tạo thảo luận</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#15803d',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginHorizontal: 12,
  },
  form: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#15803d',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateDiscussionScreen;