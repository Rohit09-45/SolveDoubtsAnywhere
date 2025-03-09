import React, {createContext, useState, useContext, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle user state changes
    const unsubscribe = auth().onAuthStateChanged(async userState => {
      if (userState) {
        // Get additional user data from Firestore
        const userDoc = await firestore().collection('users').doc(userState.uid).get();
        const userData = userDoc.data();
        setUser({...userState, ...userData});
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      // Get additional user data from Firestore
      const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
      const userData = userDoc.data();
      setUser({...userCredential.user, ...userData});
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string) => {
    try {
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Add user profile to Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        name,
        email,
        role,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update user profile
      await userCredential.user.updateProfile({
        displayName: name,
      });

      // Get the complete user data
      const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
      const userData = userDoc.data();
      setUser({...userCredential.user, ...userData});
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await auth().signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, signIn, signUp, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 