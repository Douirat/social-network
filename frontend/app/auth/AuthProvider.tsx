'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, checkAuth } from '../utils/authUtils';
import { initWebSocket } from '../api/websocket'; 

interface Message {
  type: string;
  // Add other properties as needed
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: User | null) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: () => {},
  setUser: () => {},
  messages: [],
  setMessages: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null); // Use useRef to store the WebSocket instance


  useEffect(() => {
    const initAuth = async () => {
      const { isLoggedIn, user } = await checkAuth();
      setIsLoggedIn(isLoggedIn);
      setUser(user);
    };

    initAuth();
  }, []);

   useEffect(() => {
    if (isLoggedIn && user) {
      const handleWebSocketMessage = (message: any) => {
        // Directly add the message to the state
        setMessages((prev) => [...prev, message]); // Add the entire message
      };

      // Initialize the WebSocket connection
      socketRef.current = initWebSocket(user.id, handleWebSocketMessage); 

      // Cleanup function to close the WebSocket when the component unmounts or user logs out
      return () => {
        socketRef.current?.close();
      };
    }
  }, [isLoggedIn, user]);


  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser, messages, setMessages }}>
      {children}
    </AuthContext.Provider>
  );
};