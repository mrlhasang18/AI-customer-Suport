import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfzXiDaTZrFG4PnHCdj4Pw_19SaxNSCH0",
  authDomain: "ai-customtersupport.firebaseapp.com",
  projectId: "ai-customtersupport",
  storageBucket: "ai-customtersupport.appspot.com",
  messagingSenderId: "931583057264",
  appId: "1:931583057264:web:5be0d743ad861fe6a043b5",
  measurementId: "G-F2QGX2GDWC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };