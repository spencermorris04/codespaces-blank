"use client";
import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Adjust import as per Next.js version
import { Provider } from 'react-redux';
import { createClient } from '~/util/supabase/client';
import { store } from '~/app/store/store';
import TopNavbar from '~/components/TopNavbar';
import MobileTopNavbar from '~/components/MobileTopNavbar';

interface User {
  id: string;
  aud: string;
  role: string; // Ensure role is always a string
  email: string;
  email_confirmed_at: string | null;
  phone: string;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: any; // Type according to your user metadata structure
  identities: any[]; // Type according to your user identities structure
  created_at: string;
  updated_at: string;
}

interface ClientSideLayoutProps {
  children: ReactNode;
}

const ClientSideLayout: React.FC<ClientSideLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Specify the type of user
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
        const user: User = {
          ...session.user,
          role: session.user.role || "defaultRole",
          email: session.user.email || "default@email.com", // Provide a default email if undefined
        };        
        setUser(user);
      }
      
    };

    checkAuth();
  }, [router]);

  return (
    <Provider store={store}>
      <div className="w-full h-screen flex flex-col">
        <div className="border-b-4 border-black">
          {user ? <TopNavbar user={user} /> : <MobileTopNavbar />}
        </div>
        <main className="flex-1 overflow-y-auto bg-neo-light-cream">
          {children}
        </main>
      </div>
    </Provider>
  );
};

export default ClientSideLayout;
