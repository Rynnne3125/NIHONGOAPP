import React, { useState, useEffect, useMemo } from 'react';
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
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { User } from '../../../data/models/User';
import { PrivateChatMessage } from '../../../data/models';
import { UserRepository } from '../../../data/repository/UserRepository';

const db = firestore();

interface PrivateChatScreenProps extends NativeStackScreenProps<any, 'private_chat/{partnerUserId}/{userEmail}'> {
  userEmail?: string;
  userRepository?: UserRepository;
}

const PrivateChatScreen: React.FC<PrivateChatScreenProps> = ({
  navigation,
  route,
  userEmail: passedEmail,
  userRepository: passedRepository,
}) => {
  const partnerUserId = route.params?.partnerUserId;
  const userEmail = route.params?.userEmail || passedEmail || '';
  const userRepository = passedRepository;
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partnerUser, setPartnerUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Create chatId from two user IDs (sorted for consistency)
  const chatId = useMemo(() => {
    if (!currentUser?.id || !partnerUserId) return '';
    const ids = [currentUser.id, partnerUserId].sort();
    return ids.join('_');
  }, [currentUser?.id, partnerUserId]);

  // Load current user and partner user
  useEffect(() => {
    const loadUsers = async () => {
      if (!partnerUserId || !userRepository) return;

      try {
        const user = await userRepository.getUserByEmail(userEmail);
        setCurrentUser(user);

        const partner = await userRepository.getUserById(partnerUserId);
        setPartnerUser(partner);

        if (chatId) {
          const messagesSnapshot = await getDocs(
            query(
              collection(db, 'privateMessages'),
              where('chatId', '==', chatId)
            )
          );

          const loadedMessages = messagesSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a: any, b: any) => {
              const aTime = a.timestamp?.toMillis?.() || 0;
              const bTime = b.timestamp?.toMillis?.() || 0;
              return aTime - bTime;
            }) as PrivateChatMessage[];

          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [userEmail, partnerUserId, chatId, userRepository]);

  // Setup real-time listener for messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'privateMessages'),
      where('chatId', '==', chatId)
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
          }) as PrivateChatMessage[];

        setMessages(newMessages);
      },
      (error: any) => {
        console.error('Listen failed:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !chatId || !partnerUserId || !userRepository) {
      return;
    }

    const sentText = messageText;
    setMessageText('');
    setIsLoading(true);

    try {
      const newMessage: Omit<PrivateChatMessage, 'id'> = {
        chatId,
        senderId: currentUser.id,
        receiverId: partnerUserId,
        senderName: currentUser.username,
        senderImageUrl: currentUser.imageUrl,
        content: sentText,
        timestamp: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(
        collection(db, 'privateMessages'),
        newMessage
      );

      const updatedUser = {
        ...currentUser,
        activityPoints: (currentUser.activityPoints || 0) + 1,
      };
      await userRepository.updateUser(updatedUser);

      if (partnerUser) {
        try {
          const notificationTitle = `Tin nhắn mới từ ${currentUser.username}`;
          const notificationMessage = sentText;

          await addDoc(collection(db, 'notifications'), {
            userId: partnerUserId,
            title: notificationTitle,
            message: notificationMessage,
            timestamp: serverTimestamp(),
            read: false,
            type: 'private_message',
            referenceId: docRef.id,
            senderId: currentUser.id,
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
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

  const renderMessage = ({ item }: { item: PrivateChatMessage }) => (
    <View style={styles.messageContainer}>
      {item.senderImageUrl && (
        <Image source={{ uri: item.senderImageUrl }} style={styles.userImage} />
      )}
      <View style={[styles.messageBubble, item.senderId === currentUser?.id ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.messageText, item.senderId === currentUser?.id ? styles.sentText : styles.receivedText]}>
          {item.content}
        </Text>
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
        {partnerUser && (
          <View style={styles.partnerInfo}>
            <Image source={{ uri: partnerUser.imageUrl || '/default-avatar.png' }} style={styles.partnerImage} />
            <View>
              <Text style={styles.partnerName}>{partnerUser.username}</Text>
              <Text style={[styles.partnerStatus, { color: partnerUser.online ? '#22c55e' : '#999' }]}>
                {partnerUser.online ? 'Đang hoạt động' : 'Không hoạt động'}
              </Text>
            </View>
          </View>
        )}
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có tin nhắn</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
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
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  partnerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  partnerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageBubble: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
  },
  sentBubble: {
    backgroundColor: '#15803d',
    marginLeft: 'auto',
    marginRight: 0,
  },
  receivedBubble: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#000',
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

export default PrivateChatScreen;