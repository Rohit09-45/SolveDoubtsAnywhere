import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, FONTS} from '../theme/theme';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../types/navigation';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  conversationId: string;
  image?: {
    uri: string;
    recognizedText?: string;
  };
}

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  hasImage: boolean;
  conversationId: string;
}

interface FirestoreError extends Error {
  code?: string;
}

const HistoryScreen: React.FC = () => {
  const {user} = useAuth();
  const navigation = useNavigation<NavigationProps>();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      console.log('No user is signed in');
      setLoading(false);
      return;
    }

    console.log('Setting up Firestore listener for user:', currentUser.uid);
    
    // Get all messages across all chats
    const unsubscribe = firestore()
      .collectionGroup('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot({
        next: async (snapshot) => {
          try {
            console.log('Received messages snapshot:', {
              count: snapshot.docs.length,
              empty: snapshot.empty
            });

            if (snapshot.empty) {
              console.log('No messages found');
              setHistory([]);
              setLoading(false);
              return;
            }

            // Map all messages
            const messages = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Message data:', {
                path: doc.ref.path,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp,
                conversationId: data.conversationId
              });
              return {
                id: doc.id,
                ...data
              } as Message;
            });

            // Group messages by conversation
            const conversationMap = new Map<string, Message[]>();
            
            messages.forEach(message => {
              if (!conversationMap.has(message.conversationId)) {
                conversationMap.set(message.conversationId, []);
              }
              conversationMap.get(message.conversationId)?.push(message);
            });

            // Create history items from conversations
            const historyItems: HistoryItem[] = [];

            conversationMap.forEach((conversationMessages, conversationId) => {
              // Find the user message and corresponding AI response
              const userMessage = conversationMessages.find(msg => msg.role === 'user');
              if (userMessage) {
                const aiResponse = conversationMessages.find(
                  msg => msg.role === 'assistant' && msg.timestamp > userMessage.timestamp
                );

                if (aiResponse) {
                  console.log('Found conversation pair:', {
                    conversationId,
                    question: userMessage.content,
                    answer: aiResponse.content
                  });

                  historyItems.push({
                    id: userMessage.id,
                    question: userMessage.content,
                    answer: aiResponse.content,
                    timestamp: userMessage.timestamp,
                    hasImage: !!userMessage.image,
                    conversationId: conversationId
                  });
                }
              }
            });

            // Sort by timestamp (newest first)
            historyItems.sort((a, b) => b.timestamp - a.timestamp);

            console.log('Final history items:', {
              count: historyItems.length,
              items: historyItems.map(item => ({
                question: item.question,
                answer: item.answer,
                timestamp: new Date(item.timestamp).toLocaleString()
              }))
            });

            setHistory(historyItems);
            setLoading(false);
          } catch (error) {
            console.error('Error processing messages:', error);
            setLoading(false);
          }
        },
        error: (error: FirestoreError) => {
          console.error('Firestore listener error:', error);
          // Check if it's an indexing error
          if (error.code === 'failed-precondition') {
            console.log('Index not found. Falling back to basic query...');
            // Fallback to a simpler query while index is being built
            const fallbackUnsubscribe = firestore()
              .collectionGroup('messages')
              .orderBy('timestamp', 'desc')
              .onSnapshot(
                fallbackSnapshot => {
                  try {
                    const messages = fallbackSnapshot.docs.map(doc => ({
                      id: doc.id,
                      ...doc.data()
                    })) as Message[];

                    // Group messages by conversation
                    const conversationMap = new Map<string, Message[]>();
                    messages.forEach(message => {
                      if (!conversationMap.has(message.conversationId)) {
                        conversationMap.set(message.conversationId, []);
                      }
                      conversationMap.get(message.conversationId)?.push(message);
                    });

                    const historyItems: HistoryItem[] = [];

                    conversationMap.forEach((conversationMessages, conversationId) => {
                      const userMessage = conversationMessages.find(msg => msg.role === 'user');
                      if (userMessage) {
                        const aiResponse = conversationMessages.find(
                          msg => msg.role === 'assistant' && msg.timestamp > userMessage.timestamp
                        );

                        if (aiResponse) {
                          historyItems.push({
                            id: userMessage.id,
                            question: userMessage.content,
                            answer: aiResponse.content,
                            timestamp: userMessage.timestamp,
                            hasImage: !!userMessage.image,
                            conversationId: conversationId
                          });
                        }
                      }
                    });

                    // Sort by timestamp (newest first)
                    historyItems.sort((a, b) => b.timestamp - a.timestamp);
                    
                    setHistory(historyItems);
                    setLoading(false);
                  } catch (error) {
                    console.error('Error in fallback query:', error);
                    setLoading(false);
                  }
                },
                fallbackError => {
                  console.error('Fallback query error:', fallbackError);
                  setLoading(false);
                }
              );
            
            // Update the unsubscribe function
            return () => fallbackUnsubscribe();
          }
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, []);

  const renderHistoryItem = ({item}: {item: HistoryItem}) => (
    <TouchableOpacity 
      style={styles.historyCard}
      onPress={() => {
        navigation.navigate('ChatDetails', {
          question: item.question,
          answer: item.answer,
          timestamp: item.timestamp,
          hasImage: item.hasImage
        });
      }}>
      <View style={styles.historyContent}>
        <Text style={styles.questionText} numberOfLines={2}>
          {item.question}
        </Text>
        <Text style={styles.answerText} numberOfLines={2}>
          {item.answer}
        </Text>
        <Text style={styles.timestampText}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        {item.hasImage && (
          <View style={styles.imageIndicator}>
            <Icon name="image-outline" size={20} color={COLORS.primary} />
          </View>
        )}
        <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="time-outline" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No History</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your question history will appear here once you start asking questions.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderColor:COLORS.border,
  },
  historyContent: {
    flex: 1,
    marginRight: 12,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 4,
  },
  answerText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timestampText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  imageIndicator: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;