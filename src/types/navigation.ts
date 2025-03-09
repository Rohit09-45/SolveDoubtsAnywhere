import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Chat: {conversationId?: string} | undefined;
  History: undefined;
  ChatDetails: {
    question: string;
    answer: string;
    timestamp: number;
    hasImage: boolean;
  };
  Auth: undefined;
  Onboarding: undefined;
  MainApp: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProps = NativeStackNavigationProp<AuthStackParamList>; 