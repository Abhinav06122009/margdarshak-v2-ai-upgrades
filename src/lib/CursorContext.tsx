import React, { createContext, useState, ReactNode } from 'react';

type CursorVariant = 'default' | 'text' | 'link';

interface CursorContextType {
  cursorVariant: CursorVariant;
  setCursorVariant: (variant: CursorVariant) => void;
}

export const CursorContext = createContext<CursorContextType>({
  cursorVariant: 'default',
  setCursorVariant: () => {},
});

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');

  return (
    <CursorContext.Provider value={{ cursorVariant, setCursorVariant }}>
      {children}
    </CursorContext.Provider>
  );
};