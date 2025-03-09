import {NavigatorScreenParams} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Onboarding screens
  OnboardingScreen1: undefined;
  OnboardingScreen2: undefined;
  OnboardingScreen3: undefined;
  
  // Auth screens
  SignIn: undefined;
  SignUp: undefined;
  
  // Main app screens
  MainApp: undefined;
  Chat: {conversationId?: string} | undefined;
  ChatDetails: {
    question: string;
    answer: string;
    timestamp: number;
    hasImage: boolean;
  };
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Remove unused types
// export type MainTabParamList = {
//   Home: undefined;
//   History: undefined;
//   Profile: undefined;
//   Chat: {conversationId?: string} | undefined;
//   ChatDetails: {
//     question: string;
//     answer: string;
//     timestamp: number;
//     hasImage: boolean;
//   };
// };

// export type OnboardingStackParamList = {
//   OnboardingScreen1: undefined;
//   OnboardingScreen2: undefined;
//   OnboardingScreen3: undefined;
// };

// export type AuthStackParamList = {
//   SignIn: undefined;
//   SignUp: undefined;
// }; 