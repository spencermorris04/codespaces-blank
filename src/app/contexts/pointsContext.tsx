"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PointsContextType {
  points: number;
  setPoints: (points: number) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider: React.FC<PointsProviderProps> = ({ children }) => {
  const [points, setPoints] = useState<number>(0);

  const handleSetPoints = useCallback((newPoints: number) => {
    setPoints(newPoints);
  }, []);

  return (
    <PointsContext.Provider value={{ points, setPoints: handleSetPoints }}>
      {children}
    </PointsContext.Provider>
  );
};
