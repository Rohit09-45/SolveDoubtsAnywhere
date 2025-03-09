import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, FONTS} from '../theme/theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NavigationProps} from '../types/navigation';

interface ChatDetailsScreenProps {
  route: {
    params: {
      question: string;
      answer: string;
      timestamp: number;
      hasImage: boolean;
    };
  };
}

const ChatDetailsScreen: React.FC<ChatDetailsScreenProps> = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const {question, answer, timestamp, hasImage} = route.params as ChatDetailsScreenProps['route']['params'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Question</Text>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{question}</Text>
            {hasImage && (
              <View style={styles.imageIndicator}>
                <Icon name="image-outline" size={20} color={COLORS.primary} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Answer</Text>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{answer}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <Text style={styles.timeText}>
            {new Date(timestamp).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth:1,
    borderColor:COLORS.border,
  },
  messageText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  imageIndicator: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginTop: 8,
  },
  timeText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
});

export default ChatDetailsScreen; 