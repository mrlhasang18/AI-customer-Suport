import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import dotenv from 'dotenv';
dotenv.config();

// console.log(process.env.REACT_APP_API_KEY);

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBcmeA7TsAkuXjytWriv5n32LEOCR9mWw",
  authDomain: "yetiai-cfb49.firebaseapp.com",
  projectId: "yetiai-cfb49",
  storageBucket: "yetiai-cfb49.appspot.com",
  messagingSenderId: "156164518882",
  appId: "1:156164518882:web:8547893a7c705b72faffbb",
  measurementId: "G-K83HP0MXCN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };