import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../theme/theme';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

const SignInScreen = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../assets/images/user.png')}
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, !email || !password ? styles.buttonDisabled : null]}
              onPress={handleSignIn}
              disabled={!email || !password || isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.link}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  keyboardView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
  } as ViewStyle,
  header: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  } as ViewStyle,
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  } as ViewStyle,
  avatarImage: {
    width: 60,
    height: 60,
    tintColor: COLORS.primary,
  } as ImageStyle,
  title: {
    ...FONTS.h1,
    color: COLORS.white,
    marginBottom: SIZES.base,
  } as TextStyle,
  subtitle: {
    ...FONTS.body2,
    color: COLORS.white,
  } as TextStyle,
  form: {
    flex: 1,
    padding: SIZES.padding * 2,
  } as ViewStyle,
  input: {
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: SIZES.base * 2,
  } as TextStyle,
  button: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  buttonDisabled: {
    backgroundColor: COLORS.primary,
  } as ViewStyle,
  buttonText: {
    ...FONTS.h3,
    color: COLORS.white,
  } as TextStyle,
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  } as ViewStyle,
  linkText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  } as TextStyle,
  link: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
  } as TextStyle,
});

export default SignInScreen; 