"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import '@fontsource/raleway'; // Import Raleway font for a modern look
import '@fontsource/roboto'; // Import Roboto font for additional styling

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/home');
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#121212"
      padding={2}
    >
      <Box
        width={{ xs: '90%', sm: '80%', md: '800px' }}
        height={{ xs: 'auto', sm: '600px', md: 'auto' }}
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        borderRadius={4}
        boxShadow="0px 6px 30px rgba(0, 0, 0, 0.7)"
        overflow="hidden"
        bgcolor="#FFFFFF"
      >
        <Box
          width={{ xs: '100%', md: '50%' }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          padding={4}
          sx={{
            bgcolor: '#FFFFFF',
            height: '100%',
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <img src="/favicon.ico" alt="Yeti AI Logo" style={{ width: 40, height: 40 }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: '#121212', ml: 1, fontFamily: 'Raleway, sans-serif' }}
            >
              YetiAI
            </Typography>
          </Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={1}
            sx={{ color: '#121212', textAlign: 'left', fontFamily: 'Raleway, sans-serif' }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography
            variant="body1"
            mb={3}
            sx={{ color: '#333', textAlign: 'left', fontFamily: 'Roboto, sans-serif' }}
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
              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#aaa' },
                '&:hover fieldset': { borderColor: '#777' },
                '&.Mui-focused fieldset': { borderColor: '#333' },
              },
              input: { color: '#121212', fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' },
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
              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#aaa' },
                '&:hover fieldset': { borderColor: '#777' },
                '&.Mui-focused fieldset': { borderColor: '#333' },
              },
              input: { color: '#121212', fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            sx={{
              bgcolor: '#007BFF',
              color: '#fff',
              mb: 2,
              '&:hover': { bgcolor: '#0056b3' },
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
              fontSize: '0.875rem',
              padding: '12px 0',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: '#121212', fontFamily: 'Roboto, sans-serif' }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href="#"
              sx={{ color: '#007BFF', cursor: 'pointer' }}
              underline="hover"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </Link>
          </Typography>
        </Box>

        <Box
          width={{ xs: '100%', md: '50%' }}
          height={{ xs: '300px', md: 'auto' }}
          bgcolor="#1E1E1E"
          m={1}
          boxShadow="0px 8px 25px rgba(0, 0, 0, 0.7)"
          sx={{
            backgroundImage: 'url(/image/ai.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '5px 5px 5px 30px',
          }}
        />
      </Box>
    </Box>
  );
}