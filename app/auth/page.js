"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Avatar,
} from "@mui/material";
import { auth, firestore, storage } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from 'firebase/firestore';
import "@fontsource/raleway"; // Import Raleway font for a modern look
import "@fontsource/roboto"; // Import Roboto font for additional styling

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (profileImage) {
          const imageRef = ref(
            storage,
            `profile_images/${userCredential.user.uid}`
          );
          await uploadBytes(imageRef, profileImage);
          const imageUrl = await getDownloadURL(imageRef);
          await updateProfile(userCredential.user, { photoURL: imageUrl });
          await addDoc(collection(firestore, "users"), {
            userId: userCredential.user.uid,
            email: userCredential.user.email,
            photoURL: imageUrl,
            createdAt: new Date(),
          });
        }
      }
      router.push("/home");
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <Box
      width="100%"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#121212"
      padding={2}
    >
      <Box
        width={{ xs: "95%", sm: "90%", md: "800px" }}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        borderRadius={4}
        boxShadow="0px 6px 30px rgba(0, 0, 0, 0.7)"
        overflow="hidden"
        bgcolor="#FFFFFF"
      >
        <Box
          width={{ xs: "100%", md: "50%" }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          padding={{ xs: 3, sm: 4 }}
          sx={{
            bgcolor: "#FFFFFF",
            height: "100%",
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <img
              src="/favicon.ico"
              alt="Yeti AI Logo"
              style={{ width: 32, height: 32 }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                color: "#121212",
                ml: 1,
                fontFamily: "Raleway, sans-serif",
              }}
            >
              YetiAI
            </Typography>
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={1}
            sx={{
              color: "#121212",
              textAlign: "left",
              fontFamily: "Raleway, sans-serif",
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography
            variant="body2"
            mb={3}
            sx={{
              color: "#333",
              textAlign: "left",
              fontFamily: "Roboto, sans-serif",
            }}
          >
            Please enter your {isLogin ? "login" : "sign up"} details below
          </Typography>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{
              mb: 2,
              "& .MuiInputLabel-root": {
                color: "#555",
                fontSize: "0.875rem",
                fontFamily: "Roboto, sans-serif",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#aaa" },
                '&:hover fieldset': { borderColor: '#4CAF50' },
                '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
              },  
              input: {
                color: "#121212",
                fontSize: "0.875rem",
                fontFamily: "Roboto, sans-serif",
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{
              mb: 2,
              "& .MuiInputLabel-root": {
                color: "#555",
                fontSize: "0.875rem",
                fontFamily: "Roboto, sans-serif",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#aaa" },
                '&:hover fieldset': { borderColor: '#4CAF50' },
                '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
              },
              input: {
                color: "#121212",
                fontSize: "0.875rem",
                fontFamily: "Roboto, sans-serif",
              },
            }}
          />

          {!isLogin && (
            <Box mb={2}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="raised-button-file"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="raised-button-file">
                <Button variant="contained" component="span">
                  Upload Profile Picture
                </Button>
              </label>
              {profileImage && (
                <Avatar
                  src={URL.createObjectURL(profileImage)}
                  sx={{ width: 60, height: 60, mt: 2 }}
                />
              )}
            </Box>
          )}

          <Button
            variant="outlined"
            onClick={handleSubmit}
            fullWidth
            sx={{
              bgcolor: "#4CAF50",
              color: "#fff",
              mb: 2,
              "&:hover": { bgcolor: "#4CAF50" },
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
              fontSize: "0.875rem",
              padding: "10px 0",
              fontFamily: "Roboto, sans-serif",
            }}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "#121212", fontFamily: "Roboto, sans-serif" }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href="#"
              sx={{ color: "#4CAF50", cursor: "pointer" }}
              underline="hover"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </Link>
          </Typography>
        </Box>

        <Box
          width={{ xs: "100%", md: "50%" }}
          height={{ xs: "200px", sm: "300px", md: "auto" }}
          bgcolor="#1E1E1E"
          m={{ xs: 0, md: 1 }}
          mt={{ xs: 2, md: 1 }}
          boxShadow="0px 8px 25px rgba(0, 0, 0, 0.7)"
          sx={{
            backgroundImage: "url(/image/ai.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: { xs: "5px", md: "5px 5px 5px 30px" },
          }}
        />
      </Box>
    </Box>
  );
}
