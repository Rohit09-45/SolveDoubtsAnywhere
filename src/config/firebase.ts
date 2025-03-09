import {initializeApp} from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDlZnF8dsLmUbahPAmEeD54h5x3I08GySQ",
  authDomain: "solvedoubtanywhere.firebaseapp.com",
  projectId: "solvedoubtanywhere",
  storageBucket: "solvedoubtanywhere.firebasestorage.app",
  messagingSenderId: "1018414207863",
  appId: "1:1018414207863:android:71aae2263b79d244768772"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export {auth, firestore};
export default app; 