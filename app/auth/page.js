"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { auth, firestore, storage } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from 'firebase/firestore';
import Image from "next/image";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (!isLogin) { 
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        if (profileImage) {
          const storageRef = ref(storage, `profile_images/${userCredential.user.uid}`);
          await uploadBytes(storageRef, profileImage);
          const downloadURL = await getDownloadURL(storageRef);
          
          await updateProfile(userCredential.user, {
            displayName: name, 
            photoURL: downloadURL
          });
          
          // Store user data in Firestore
          await addDoc(collection(firestore, "users"), {
            name, 
            email,
            photoURL: downloadURL
          });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/home");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };





// visuals for UI


  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: { xs: '100%', sm: '90%', md: '800px' },
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.7)',
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            padding: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Image src="/favicon.ico" alt="Yeti AI Logo" width={32} height={32} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#121212',
                ml: 1,
                fontFamily: 'Raleway, sans-serif',
              }}
            >
              YetiAI
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#121212',
              mb: 1,
              fontFamily: 'Raleway, sans-serif',
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#333',
              mb: 3,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Please enter your {isLogin ? "login" : "sign up"} details below
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            {!isLogin && (
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="raised-button-file">
                  <Button
                    variant="contained"
                    component="span"
                    fullWidth
                    sx={{
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#1565c0' },
                    }}
                  >
                    Upload Profile Picture
                  </Button>
                </label>
              </Box>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 2,
                backgroundColor: '#4CAF50',
                color: '#fff',
                '&:hover': { backgroundColor: '#45a049' },
              }}
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <Typography variant="body2" align="center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              component="button"
              variant="body2"
              onClick={() => setIsLogin(!isLogin)}
              sx={{ color: '#4CAF50' }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </Link>
          </Typography>
        </Box>
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            height: { xs: '200px', md: 'auto' },
            backgroundColor: '#1E1E1E',
            backgroundImage: 'url(/image/ai.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </Box>
    </Box>
  );
}