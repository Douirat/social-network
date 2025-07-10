"use client"; // Add this line at the top of the file

import React, { ReactNode } from 'react';
import { ReactionsProvider as ReactionsContextProvider } from '../context/ReactionsContext';

export function ReactionsProvider({ children }: { children: ReactNode }) {
  return (
    <ReactionsContextProvider>
      {children}
    </ReactionsContextProvider>
  );
}