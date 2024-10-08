// Feedback section with firebase integration added + Better UI

"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from "@mui/material";
import { auth, firestore } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import SendIcon from "@mui/icons-material/Send";
import FeedbackIcon from "@mui/icons-material/Feedback";
import Image from "next/image";

// Predefined Q&A
const predefinedQA = [
  {
    question: "What is SecurityPal?",
    answer:
      "SecurityPal is a comprehensive cybersecurity solution designed to protect individuals and organizations from digital threats. It offers advanced features such as real-time threat detection, secure communication channels, and vulnerability assessments.",
  },
  {
    question: "How does SecurityPal enhance digital security?",
    answer:
      "SecurityPal enhances digital security through a multi-layered approach, including real-time monitoring, AI-powered threat detection, encryption of communication channels, regular security audits, and user education on best security practices.",
  },
  {
    question: "What tools does SecurityPal use to prevent cyber attacks?",
    answer:
      "SecurityPal employs various tools to safeguard users, including advanced firewalls, intrusion detection systems, malware scanners, multi-factor authentication, and secure VPN services. It also utilizes machine learning algorithms to detect and prevent novel threats.",
  },
];

export default function Home() {
  const [user] = useAuthState(auth);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(3);
  const [feedbackComment, setFeedbackComment] = useState("");
  const router = useRouter();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      console.log("User object:", user);
      console.log("User photo URL:", user.photoURL);
      setUserPhotoURL(user.photoURL);
    }
  }, [user]);

  useEffect(() => {
    const fetchPreviousChatSession = async () => {
      if (user) {
        const q = query(
          collection(firestore, "chat_sessions"),
          where("userId", "==", user.uid)
        );
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
    }
    fetchPreviousChatSession();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //

  const sendMessage = async (content = message) => {
    if (!content || loading || !currentChatId) return;
    setLoading(true);

    const userMessage = { role: "user", content };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    // for predefined Q&A match
    const matchedQA = predefinedQA.find(
      (qa) => qa.question.toLowerCase() === content.toLowerCase()
    );

    if (matchedQA) {
      // predefined answer with a delay
      const answerChunks = matchedQA.answer.split(". ");
      const delay = 1000;

      for (let i = 0; i < answerChunks.length; i++) {
        const chunk = answerChunks[i] + ". ";
        const assistantMessage = { role: "assistant", content: chunk };

        if (i === 0) {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = assistantMessage;
            return updatedMessages;
          });
        } else {
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }

        if (user && currentChatId) {
          const chatDocRef = doc(firestore, "chat_sessions", currentChatId);
          await updateDoc(chatDocRef, {
            messages: [...messages, userMessage, assistantMessage],
            timestamp: serverTimestamp(),
          });
        }

        if (i < answerChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      setLoading(false);
    } else {
      // for non-predefined questions, let's call gemini api
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
            const otherMessages = prevMessages.slice(
              0,
              prevMessages.length - 1
            );
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
    }
  };

  // for feedback using material ui
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const handleNewChat = async () => {
    if (user) {
      try {
        const docRef = await addDoc(collection(firestore, "chat_sessions"), {
          userId: user.uid,
          messages: [
            {
              role: "assistant",
              content:
                "Namaste, I am Yeti, SecurityPals support Agent. How can I assist you today?",
            },
          ],
          timestamp: serverTimestamp(),
        });
        setCurrentChatId(docRef.id);
        setMessages([
          {
            role: "assistant",
            content:
              "Namaste, I am Yeti, SecurityPals support Agent. How can I assist you today?",
          },
        ]);
      } catch (error) {
        console.error("Error creating new chat session:", error);
      }
    }
  };

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };

  //for feedback
  const handleFeedbackSubmit = async () => {
    if (user) {
      try {
        await addDoc(collection(firestore, "feedback"), {
          userId: user.uid,
          rating: feedbackRating,
          comment: feedbackComment,
          timestamp: serverTimestamp(),
        });
        handleFeedbackClose();
        setFeedbackRating(3);
        setFeedbackComment("");
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#121212",
        color: "white",
      }}
    >
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          fontFamily="Orbitron"
          fontSize="48px"
          fontWeight="bold"
          color="#33CCFF"
          textShadow="0px 0px 10px rgba(255, 255, 255, 0.5)"
        >
          YETI AI
        </Typography>
        <Typography variant="subtitle1">
          Your personal AI security assistant
        </Typography>
      </Box>

      {user ? (
        <Box
          sx={{
            flexGrow: 1,
            mx: 3,
            mb: 3,
            bgcolor: "#1E1E1E",
            borderRadius: "16px 16px 0 0",
            border: "1px solid #333",
            borderBottom: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{ bgcolor: "#", color: "#fff", border: "1px solid #4CAF50" }}
            >
              Sign Out
            </Button>
            <Button
              variant="contained"
              onClick={handleNewChat}
              sx={{ bgcolor: "#4CAF50", color: "#fff" }}
            >
              New Chat
            </Button>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                {message.role === "assistant" && (
                  <Avatar sx={{ mr: 1, bgcolor: "primary.main" }}>
                    <Image
                      src="/yeti.png"
                      alt="Yeti Avatar"
                      width={40}
                      height={40}
                    />
                  </Avatar>
                )}
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    bgcolor: message.role === "user" ? "#222222" : "#292929",
                    color: "white",
                    borderRadius:
                      message.role === "user"
                        ? "20px 20px 0 20px"
                        : "20px 20px 20px 0",
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
                {message.role === "user" && (
                  <Avatar
                    sx={{ ml: 1, bgcolor: "secondary.main" }}
                    src={userPhotoURL}
                  >
                    {!userPhotoURL && user?.displayName
                      ? user.displayName[0].toUpperCase()
                      : null}
                  </Avatar>
                )}
              </Box>
            ))}
            {messages.length === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Start:
                </Typography>
                {predefinedQA.map((qa, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    onClick={() => sendMessage(qa.question)}
                    sx={{
                      mr: 1,
                      mb: 1,
                      color: "#4CAF50",
                      borderColor: "#4CAF50",
                    }}
                  >
                    {qa.question}
                  </Button>
                ))}
              </Box>
            )}
            <div ref={messageEndRef} />
          </Box>

          <Box sx={{ p: 2, bgcolor: "#1E1E1E" }}>
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
                  <IconButton
                    onClick={() => sendMessage()}
                    disabled={loading}
                    sx={{
                      bgcolor: "#FFD700",
                      color: "black",
                      "&:hover": { bgcolor: "#FFD700" },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#4CAF50" },
                  "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
                },
              }}
            />
          </Box>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Please sign in to start chatting.
        </Typography>
      )}

      <IconButton
        onClick={handleFeedbackOpen}
        sx={{
          position: "fixed",
          bottom: 66,
          right: 16,
          bgcolor: "#FFD700",
          color: "black",
        }}
      >
        <FeedbackIcon />
      </IconButton>

      <Dialog open={feedbackOpen} onClose={handleFeedbackClose}>
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <Typography component="legend">Rate your experience:</Typography>
          <Rating
            name="feedback-rating"
            value={feedbackRating}
            onChange={(event, newValue) => {
              setFeedbackRating(newValue);
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="feedback-comment"
            label="Comments (optional)"
            type="text"
            fullWidth
            variant="standard"
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFeedbackClose}>Cancel</Button>
          <Button onClick={handleFeedbackSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
