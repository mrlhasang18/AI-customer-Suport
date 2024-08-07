"use client";
import { Box, Button, Stack, TextField } from "@mui/material";
import Image from "next/image";
import { use, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste I am Yeti, SecurityPals support Agent, how can I assist you today?",
    },
  ]);

  const [message, setMessage] = useState("");

  //hover function
  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    try {
      console.log("Sending message to API");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });
  
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}, stack: ${errorData.stack}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        console.log("Received chunk:", text);
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: `Sorry, there was an error processing your request: ${error.message}` },
      ]);
    }
  };