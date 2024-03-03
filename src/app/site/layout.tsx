"use client";
import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Adjust import as per Next.js version
import { Provider } from 'react-redux';
import { createClient } from '~/util/supabase/client';
import { store } from '~/app/store/store';
import TopNavbar from '~/components/TopNavbar';
import MobileTopNavbar from '~/components/MobileTopNavbar';

interface ClientSideLayoutProps {
  children: ReactNode;
}

const ClientSideLayout: React.FC<ClientSideLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null); // State to hold the user object
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Function to recursively clone and inject props into children
  const injectPropsToChildren = (children: ReactNode, addedProps: {}) => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, addedProps);
      }
      return child;
    });
  };

  return (
    <Provider store={store}>
      <div className="w-full h-screen flex flex-col">
        <div className="border-b-4 border-black">
          {isMobile ? <MobileTopNavbar user={user} /> : <TopNavbar user={user} />}
        </div>
        <main className="flex-1 overflow-y-auto bg-neo-light-cream">
          {injectPropsToChildren(children, { user })}
        </main>
      </div>
    </Provider>
  );
};

export default ClientSideLayout;
