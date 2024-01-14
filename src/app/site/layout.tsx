"use client";
import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import TopNavbar from '~/components/TopNavbar';
import MobileTopNavbar from '~/components/MobileTopNavbar';

const ClientSideLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set the breakpoint for mobile
    };

    // Set the initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Provider store={store}>
      <div className="w-full h-screen flex flex-col">
        <div className="border-b-4 border-black">
          {isMobile ? <MobileTopNavbar /> : <TopNavbar />}
        </div>
        <main className="flex-1 overflow-y-auto bg-neo-light-cream">
          {children}
        </main>
      </div>
    </Provider>
  );
};

export default ClientSideLayout;
