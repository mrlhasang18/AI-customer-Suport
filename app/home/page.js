"use client";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { auth, firestore } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useRef } from "react";

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

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2,
        bgcolor: '#181818',
        color: '#fff' 
      }}
    >
      {user ? (
        <>
          <Button variant="contained" onClick={handleLogout} sx={{ bgcolor: '#707070', color: '#fff', marginRight: '10px' }}>
            Sign Out
          </Button>
          <Button variant="contained" onClick={handleNewChat} sx={{ bgcolor: '#707070', color: '#fff' }}>
            New Chat
          </Button>
          <Stack
            direction="column"
            width="70%"
            height="100%"
            border="1px solid #404040"
            p={2}
            spacing={3}
            sx={{ borderRadius: '16px' }} 
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
              sx={{ backgroundColor: '#1F1F1F', padding: '20px', borderRadius: '16px' }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bgcolor={
                      message.role === "assistant"
                        ? "#292929"
                        : "#222222"
                    }
                    color="white"
                    p={3}
                    borderRadius={16}
                    sx={{ maxWidth: '60%', wordBreak: 'break-word' }} 
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
              <div ref={messageEndRef} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ backgroundColor: '#292929', color: '#fff', '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#404040' } }, '& .MuiInputLabel-root': { color: '#fff' }, '& .MuiInputBase-input': { color: '#fff' } }} 
              />
              <Button variant="contained" onClick={sendMessage} disabled={loading} sx={{ bgcolor: '#5E5E5E', color: '#fff', '&:hover': { bgcolor: '#707070' } }}>
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </Stack>
          </Stack>
        </>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center' }}>Please sign in to start chatting.</Typography>
      )}
    </Box>
  );
}
