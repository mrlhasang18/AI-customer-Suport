"use client";
import { Box, Button, Stack, TextField, Typography, Avatar } from "@mui/material";
import { auth, firestore } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useRef } from "react";
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const router = useRouter();
  const messageEndRef = useRef(null);

  useEffect(() => {
    const fetchPreviousChatSession = async () => {
      if (user) {
        const q = query(collection(firestore, "chat_sessions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setCurrentChatId(doc.id);
          const data = doc.data();
          if (data && data.messages) {
            setMessages(data.messages);
          }
        } else {
          handleNewChat(); 
        }
      }
    };
    fetchPreviousChatSession();
  }, [user]);

  const sendMessage = async () => {
    if (!message || loading || !currentChatId) return;
    setLoading(true);

    if (!hasStarted) {
      setHasStarted(true);
    }

    const userMessage = { role: "user", content: message };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }

      if (user && currentChatId) {
        const chatDocRef = doc(firestore, "chat_sessions", currentChatId);
        await updateDoc(chatDocRef, {
          messages: [...messages, userMessage],
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth');
  };

  const handleNewChat = async () => {
    if (user) {
      try {
        const docRef = await addDoc(collection(firestore, "chat_sessions"), {
          userId: user.uid,
          messages: [
            {
              role: "assistant",
              content: "Namaste, I am Yeti, SecurityPals support Agent, how can I assist you today?",
            }
          ],
          timestamp: serverTimestamp(),
        });
        setCurrentChatId(docRef.id);
        setMessages([
          {
            role: "assistant",
            content: "Namaste, I am Yeti, SecurityPals support Agent, how can I assist you today?",
          }
        ]);
      } catch (error) {
        console.error("Error creating new chat session:", error);
      }
    }
  };

 // ...

return (
  <Box
    sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#121212',
      color: 'white'
    }}
  >
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        YETI AI
      </Typography>
      <Typography variant="subtitle1">
        Your personal AI security assistant
      </Typography>
    </Box>

    {user ? (
      <Box sx={{
        flexGrow: 1,
        mx: 3,
        mb: 3,
        bgcolor: '#1E1E1E',
        borderRadius: '16px 16px 0 0',
        border: '1px solid #333',
        borderBottom: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '600px', // Reduced width
        margin: '0 auto' // Centered horizontally
      }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" onClick={handleLogout} sx={{ bgcolor: '#707070', color: '#fff' }}>
            Sign Out
          </Button>
          <Button variant="contained" onClick={handleNewChat} sx={{ bgcolor: '#707070', color: '#fff' }}>
            New Chat
          </Button>
        </Box>

        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          maxHeight: '400px' // Limited height
        }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>YA</Avatar>
              )}
              <Box
                sx={{
                  bgcolor: message.role === 'user' ? '#222222' : '#292929',
                  color: 'white',
                  borderRadius: 2,
                  p: 2,
                  maxWidth: '70%'
                }}
              >
                <Typography>{message.content}</Typography>
              </Box>
              {message.role === 'user' && (
                <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>U</Avatar>
              )}
            </Box>
          ))}
          <div ref={messageEndRef} />
        </Box>

        <Box sx={{ p: 2, bgcolor: '#1E1E1E' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={sendMessage}
                  disabled={loading}
                  sx={{ bgcolor: '#FFD700', color: 'black', '&:hover': { bgcolor: '#FFD700' } }}
                >
                  <SendIcon />
                </Button>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#444' },
                '&.Mui-focused fieldset': { borderColor: '#555' },
              },
            }}
          />
        </Box>
      </Box>
    ) : (
      <Typography variant="body1" sx={{ textAlign: 'center' }}>Please sign in to start chatting.</Typography>
    )}
  </Box>
);
}