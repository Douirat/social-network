"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { fetchAvailableReactions } from '../api/reactions';

export interface ReactionType {
  id: number;
  name: string;
  icon_url: string;
}

interface ReactionsContextType {
  reactions: ReactionType[];
  setReactions: (reactions: ReactionType[]) => void;
}

export const ReactionsContext = createContext<ReactionsContextType>({
  reactions: [],
  setReactions: () => {},
});

export function ReactionsProvider({ children }: { children: ReactNode }) {
  const [reactions, setReactions] = useState<ReactionType[]>([]);

  useEffect(() => {
    const loadReactions = async () => {
      try {
        const reactionsData = await fetchAvailableReactions();
        setReactions(reactionsData);
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
      }
    };
    loadReactions();
  }, []);

  return (
    <ReactionsContext.Provider value={{ reactions, setReactions }}>
      {children}
    </ReactionsContext.Provider>
  );
}

// Add this custom hook
export function useReactions() {
  const context = useContext(ReactionsContext);
  if (context === undefined) {
    throw new Error('useReactions must be used within a ReactionsProvider');
  }
  return context;
}