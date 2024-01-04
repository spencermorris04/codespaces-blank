"use client";
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import TopNavbar from '~/components/TopNavbar';

const ClientSideLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <div className="w-full h-screen flex flex-col"> {/* Full viewport height */}
        <div className="border-b-4 border-black"> {/* Fixed navbar height */}
          <TopNavbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-neo-light-cream"> {/* Remaining space */}
          {children}
        </main>
      </div>
    </Provider>
  );
};

export default ClientSideLayout;
