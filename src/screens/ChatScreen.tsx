import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Image,
  Keyboard,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Pressable,
  Dimensions,
  Linking,
  Permission,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {COLORS, FONTS, SIZES} from '../theme/theme';
import { NavigationProps } from '../types/navigation';
import {useAuth} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import {useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';

interface ChatScreenProps {
  navigation: NavigationProps;
  route: RouteProp<RootStackParamList, 'Chat'>;
}

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

const OPENROUTER_API_KEY = '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'; // Replace with your actual API key
const SITE_URL = 'YOUR_SITE_URL'; // Replace with your site URL
const SITE_NAME = 'SolveDoubtsAnywhere'; // Your app name

const ChatScreen: React.FC<ChatScreenProps> = ({navigation, route}) => {
  const {user} = useAuth();
  const [question, setQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history from Firestore
  useEffect(() => {
    if (user) {
      console.log('Setting up Firestore listener for user:', user.uid);
      const messagesRef = firestore()
        .collection('chats')
        .doc(user.uid)
        .collection('messages');

      const query = route.params?.conversationId
        ? messagesRef.where('conversationId', '==', route.params.conversationId).orderBy('timestamp', 'asc')
        : messagesRef.orderBy('timestamp', 'asc');

      console.log('Query params:', {
        conversationId: route.params?.conversationId,
        userId: user.uid
      });

      const unsubscribe = query.onSnapshot(snapshot => {
        console.log('Received Firestore snapshot, docs count:', snapshot.docs.length);
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Message data:', data);
          return {
            id: doc.id,
            ...data,
          };
        }) as Message[];
        console.log('Processed messages:', messages);
        setChatHistory(messages);
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }, 100);
      }, error => {
        console.error('Firestore listener error:', error);
      });

      return () => unsubscribe();
    }
  }, [user, route.params?.conversationId]);

  const checkCameraPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // First check if permissions are already granted
        const cameraStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        const storagePermission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const storageStatus = await PermissionsAndroid.check(storagePermission);

        console.log('Initial permission status:', {
          camera: cameraStatus,
          storage: storageStatus
        });

        // If both permissions are already granted, return true
        if (cameraStatus && storageStatus) {
          console.log('All permissions already granted');
          return true;
        }

        // If any permission is not granted, request them
        if (!cameraStatus || !storageStatus) {
          // Request camera permission if needed
          if (!cameraStatus) {
            const cameraResult = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CAMERA,
              {
                title: 'Camera Permission',
                message: 'App needs access to your camera to take photos.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
            console.log('Camera permission request result:', cameraResult);
            
            if (cameraResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
              console.log('Camera permission permanently denied, redirecting to settings');
              Alert.alert(
                'Camera Permission Required',
                'Camera access has been permanently denied. Please enable it from Settings.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Open Settings', 
                    onPress: () => {
                      console.log('Opening settings...');
                      Linking.openSettings();
                    }
                  }
                ]
              );
              return false;
            }
          }

          // Request storage permission if needed
          if (!storageStatus) {
            const storageResult = await PermissionsAndroid.request(
              storagePermission,
              {
                title: 'Storage Permission',
                message: 'App needs access to your storage to save photos.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
            console.log('Storage permission request result:', storageResult);
          }

          // Check final permission status
          const finalCameraStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          const finalStorageStatus = await PermissionsAndroid.check(storagePermission);

          console.log('Final permission status:', {
            camera: finalCameraStatus,
            storage: finalStorageStatus
          });

          return finalCameraStatus && finalStorageStatus;
        }

        return true;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const checkGalleryPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const status = await PermissionsAndroid.check(permission);
        
        if (status) {
          return true;
        }

        const result = await PermissionsAndroid.request(permission, {
          title: 'Photos Permission',
          message: 'App needs access to your photos to select images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        return result === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Gallery permission error:', err);
        return false;
      }
    }
    return true;
  };

  const processImage = async (imageUri: string | undefined) => {
    if (!imageUri) return '';

    try {
      const processedUri = Platform.OS === 'android' 
        ? `file://${imageUri}` 
        : imageUri;
      
      const result = await TextRecognition.recognize(processedUri);
      
      if (!result || !result.text) {
        Alert.alert(
          'No Text Found',
          'Could not detect any text in the image. Please try with a clearer image.',
          [{ text: 'OK' }]
        );
        return '';
      }

      return result.text;
    } catch (error) {
      console.error('Text recognition error:', error);
      Alert.alert(
        'Text Recognition Error',
        'Failed to process the image. Please try again with a different image.',
        [{ text: 'OK' }]
      );
      return '';
    }
  };

  const handleCameraLaunch = async () => {
    setIsModalVisible(false);
    try {
      console.log('Starting camera launch process...');
      
      // Check if permissions are already granted
      const cameraStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const storagePermission = (Platform.Version as number) >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      const storageStatus = await PermissionsAndroid.check(storagePermission);

      console.log('Current permission status:', {
        camera: cameraStatus,
        storage: storageStatus
      });

      // If permissions are not granted, try to request them
      if (!cameraStatus || !storageStatus) {
        const hasPermission = await checkCameraPermissions();
        if (!hasPermission) {
          return; // Permission check function will handle the alert
        }
      }

      console.log('Launching camera with options...');
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: false,
        cameraType: 'back',
      });

      console.log('Camera result:', result);

      if (result.didCancel) {
        console.log('Camera capture cancelled by user');
        return;
      }

      if (result.errorCode) {
        console.error('Camera error:', result.errorCode, result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to capture image');
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        console.log('Image captured successfully:', result.assets[0].uri);
        setSelectedImage(result.assets[0]);
        setLoading(true);
        const recognizedText = await processImage(result.assets[0].uri);
        if (recognizedText) {
          setQuestion(prevQuestion => 
            prevQuestion ? `${prevQuestion}\n\nText from image:\n${recognizedText}` 
                       : `Text from image:\n${recognizedText}`
          );
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to launch camera. Please try again.');
      setLoading(false);
    }
  };

  const handleGalleryLaunch = async () => {
    setIsModalVisible(false);
    const hasPermission = await checkGalleryPermissions();
    
    if (!hasPermission) {
      Alert.alert(
        'Photos Permission Required',
        'Please grant photos permission to select images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        setSelectedImage(result.assets[0]);
        setLoading(true);
        const recognizedText = await processImage(result.assets[0].uri);
        if (recognizedText) {
          setQuestion(prevQuestion => 
            prevQuestion ? `${prevQuestion}\n\nText from image:\n${recognizedText}` 
                       : `Text from image:\n${recognizedText}`
          );
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!question.trim() && !selectedImage) return;

    try {
      setLoading(true);
      const conversationId = route.params?.conversationId || Date.now().toString();
      
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: question.trim(),
        timestamp: Date.now(),
        conversationId,
        ...(selectedImage && {
          image: {
            uri: selectedImage.uri,
            recognizedText: question.includes('Text from image:') ? question : undefined
          }
        })
      };

      // Update UI immediately with user message
      setChatHistory(prev => [...prev, userMessage]);
      setQuestion('');
      setSelectedImage(null);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);

      // Save user message to Firestore in background
      firestore()
        .collection('chats')
        .doc(user.uid)
        .collection('messages')
        .add(userMessage)
        .catch(error => {
          console.error('Error saving user message:', error);
        });

      // Make API call to OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'X-Title': SITE_NAME,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: userMessage.content,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices?.[0]?.message?.content) {
        // Create AI message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.choices[0].message.content.trim(),
          timestamp: Date.now(),
          conversationId,
        };
        
        // Update UI immediately with AI response
        setChatHistory(prev => [...prev, aiMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }, 100);

        // Save AI message to Firestore in background
        firestore()
          .collection('chats')
          .doc(user.uid)
          .collection('messages')
          .add(aiMessage)
          .catch(error => {
            console.error('Error saving AI message:', error);
          });

      } else {
        throw new Error('Invalid response format from AI');
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to get response. Please try again.',
        [{text: 'OK'}]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask a Doubt</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <View style={styles.chatContainer}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.chatContent,
              chatHistory.length === 0 && styles.emptyChatContent
            ]}>
            {chatHistory.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="chatbubble-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>Start a conversation by typing a message</Text>
              </View>
            ) : (
              chatHistory.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userMessage : styles.aiMessage,
                  ]}>
                  {message.image && message.image.uri && (
                    <View style={styles.messageImageContainer}>
                      <Image
                        source={{ uri: message.image.uri }}
                        style={styles.messageImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  <Text style={[
                    styles.messageText,
                    message.role === 'assistant' && styles.aiMessageText
                  ]}>
                    {message.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.bottomContainer}>
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.selectedImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={styles.removeImageButton}>
                <Icon name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => setIsModalVisible(true)}>
              <Icon name="camera" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder="Type your question..."
              multiline
              placeholderTextColor={COLORS.textSecondary}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!question.trim() && !selectedImage) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={loading || (!question.trim() && !selectedImage)}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Icon 
                  name="send" 
                  size={24} 
                  color={(!question.trim() && !selectedImage) ? COLORS.textSecondary : COLORS.white} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCameraLaunch}>
              <Icon name="camera-outline" size={24} color={COLORS.text} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGalleryLaunch}>
              <Icon name="image-outline" size={24} color={COLORS.text} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginLeft: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyChatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    marginLeft: '20%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    marginRight: '20%',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  messageText: {
    ...FONTS.body3,
    color: COLORS.white,
  },
  aiMessageText: {
    color: COLORS.text,
  },
  messageImageContainer: {
    marginHorizontal: -12,
    marginTop: -12,
    marginBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  messageImage: {
    width: '100%',
    height: 200,
  },
  bottomContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
  },
  selectedImageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    ...FONTS.body3,
    color: COLORS.text,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F8F8F8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginLeft: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen; 