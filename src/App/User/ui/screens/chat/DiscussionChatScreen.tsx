import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore, {
  collection,
  doc,
  getDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { User } from '../../../data/models/User';
import { Discussion, DiscussionMessage } from '../../../data/models';
import { UserRepository } from '../../../data/repository/UserRepository';

const db = firestore();

interface DiscussionChatScreenProps extends NativeStackScreenProps<any, 'discussion_chat/{discussionId}/{userEmail}'> {
  userEmail?: string;
  userRepository?: UserRepository;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  userImage?: string;
}

const DiscussionChatScreen: React.FC<DiscussionChatScreenProps> = ({
  navigation,
  route,
  userEmail: passedEmail,
  userRepository: passedRepository,
}) => {
  const discussionId = route.params?.discussionId;
  const userEmail = route.params?.userEmail || passedEmail || '';
  const userRepository = passedRepository;
  
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load discussion and current user
  useEffect(() => {
    const loadData = async () => {
      if (!discussionId || !userRepository) return;

      try {
        const discussionDoc = await getDoc(
          doc(db, 'discussions', discussionId)
        );
        if (discussionDoc.exists()) {
          setDiscussion({
            id: discussionDoc.id,
            ...discussionDoc.data(),
          } as Discussion);
        }

        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);

        const messagesSnapshot = await getDocs(
          query(
            collection(db, 'discussionMessages'),
            where('discussionId', '==', discussionId)
          )
        );

        const initialMessages = messagesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a: any, b: any) => {
            const aTime = a.timestamp?.toMillis?.() || 0;
            const bTime = b.timestamp?.toMillis?.() || 0;
            return aTime - bTime;
          }) as DiscussionMessage[];

        setMessages(initialMessages);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [discussionId, userEmail, userRepository]);

  // Setup real-time listener
  useEffect(() => {
    if (!discussionId) return;

    const q = query(
      collection(db, 'discussionMessages'),
      where('discussionId', '==', discussionId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a: any, b: any) => {
            const aTime = a.timestamp?.toMillis?.() || 0;
            const bTime = b.timestamp?.toMillis?.() || 0;
            return aTime - bTime;
          }) as DiscussionMessage[];

        setMessages(newMessages);
      },
      (error: any) => {
        console.error('Listen failed:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [discussionId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !discussionId || !userRepository) {
      return;
    }

    const sentText = messageText;
    setMessageText('');
    setIsLoading(true);

    try {
      const newMessage: Omit<DiscussionMessage, 'id'> = {
        discussionId,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderImageUrl: currentUser.imageUrl,
        content: sentText,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, 'discussionMessages'),
        newMessage
      );

      await updateDoc(doc(db, 'discussions', discussionId), {
        lastActivity: serverTimestamp(),
      });

      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 2,
      };
      await userRepository.updateUser(updatedUser);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(sentText);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: DiscussionMessage }) => (
    <View style={styles.messageContainer}>
      {item.senderImageUrl && (
        <Image source={{ uri: item.senderImageUrl }} style={styles.userImage} />
      )}
      <View style={styles.messageBubble}>
        <Text style={styles.userName}>{item.senderName}</Text>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{discussion?.title || 'Thảo luận'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Nhập bình luận..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={isLoading || !messageText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
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
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 10,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#15803d',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DiscussionChatScreen;