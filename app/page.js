"use client";
import { useRouter } from 'next/navigation';
import { Box, Button } from '@mui/material';

export default function Welcome() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/auth');
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <h1>Welcome to SecurityPals!</h1>
      <Button variant="contained" onClick={handleNavigate}>
        Get Started
      </Button>
    </Box>
  );
}

