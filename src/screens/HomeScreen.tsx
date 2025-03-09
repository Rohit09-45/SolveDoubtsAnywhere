import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, FONTS} from '../theme/theme';
import {NavigationProps} from '../types/navigation';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface HomeScreenProps {
  navigation: NavigationProps;
}

interface Doubt {
  id: string;
  question: string;
  timestamp: number;
  hasImage: boolean;
  conversationId: string;
  answer?: string;
}

interface FirestoreError extends Error {
  code?: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recentDoubts, setRecentDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      console.log('No user is signed in');
      setLoading(false);
      return;
    }

    console.log('Fetching recent doubts');
    
    // Get all messages across all chats
    const unsubscribe = firestore()
      .collectionGroup('messages')
      .where('role', '==', 'user')  // Only get user messages
      .orderBy('timestamp', 'desc')  // Get newest first
      .limit(5)  // Only get 5 most recent
      .onSnapshot({
        next: async (snapshot) => {
          try {
            console.log('Received messages snapshot:', {
              count: snapshot.docs.length,
              empty: snapshot.empty
            });

            if (snapshot.empty) {
              console.log('No messages found');
              setRecentDoubts([]);
              setLoading(false);
              return;
            }

            // Map messages to doubts
            const doubts: Doubt[] = [];

            for (const doc of snapshot.docs) {
              const data = doc.data();
              console.log('Message data:', {
                path: doc.ref.path,
                content: data.content,
                timestamp: data.timestamp
              });

              // Get the AI response for this message
              const responses = await firestore()
                .collectionGroup('messages')
                .where('conversationId', '==', data.conversationId)
                .where('role', '==', 'assistant')
                .where('timestamp', '>', data.timestamp)
                .orderBy('timestamp')
                .limit(1)
                .get();

              if (!responses.empty) {
                const response = responses.docs[0].data();
                doubts.push({
                  id: doc.id,
                  question: data.content,
                  answer: response.content,
                  timestamp: data.timestamp,
                  hasImage: !!data.image,
                  conversationId: data.conversationId
                });
              }
            }

            console.log('Recent doubts:', {
              count: doubts.length,
              doubts: doubts.map(d => ({
                question: d.question,
                answer: d.answer,
                timestamp: new Date(d.timestamp).toLocaleString()
              }))
            });

            setRecentDoubts(doubts);
            setLoading(false);
          } catch (error) {
            console.error('Error processing messages:', error);
            setLoading(false);
          }
        },
        error: error => {
          console.error('Firestore listener error:', error);
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, []);

  const renderDoubtItem = ({ item }: { item: Doubt }) => (
    <TouchableOpacity 
      style={styles.doubtCard}
      onPress={() => {
        if (item.answer) {
          navigation.navigate('ChatDetails', {
            question: item.question,
            answer: item.answer,
            timestamp: item.timestamp,
            hasImage: item.hasImage
          });
        }
      }}>
      <View style={styles.doubtContent}>
        <Text style={styles.doubtText} numberOfLines={2}>
          {item.question}
        </Text>
        <Text style={styles.timestampText}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      {item.hasImage && (
        <View style={styles.imageIndicator}>
          <Icon name="image-outline" size={20} color={COLORS.primary} />
        </View>
      )}
      <Icon 
        name="chevron-forward" 
        size={20} 
        color={COLORS.textSecondary} 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Icon 
        name="help-circle-outline" 
        size={80} 
        color={COLORS.textSecondary}
      />
      <Text style={styles.emptyStateTitle}>No Recent Doubts</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your questions will appear here. Tap the button below to ask your first question.
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
        <Text style={styles.title}>Recent Doubts</Text>
      </View>

      <FlatList
        data={recentDoubts}
        renderItem={renderDoubtItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          recentDoubts.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={EmptyState}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chat')}>
        <Icon name="add" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Ask a Question</Text>
      </TouchableOpacity>
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
  doubtCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderColor:COLORS.border,
  },
  doubtContent: {
    flex: 1,
    marginRight: 12,
  },
  doubtText: {
    ...FONTS.body2,
    color: COLORS.text,
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
    marginRight: 8,
  },
  chevron: {
    marginLeft: 'auto',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default HomeScreen; 