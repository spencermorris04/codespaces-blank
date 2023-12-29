"use client";
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import TopNavbar from '~/components/TopNavbar';

const ClientSideLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <div className="flex-1 flex flex-col">
        <div className="border-b-4 border-black">
          <TopNavbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-neo-light-cream">
          {children}
        </main>
      </div>
    </Provider>
  );
};

export default ClientSideLayout;
