"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SvgIconComponent } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  HomeOutlined,
  LibraryMusicOutlined,
  BlurLinearOutlined,
  ForumOutlined,
  SettingsOutlined,
  BarChartOutlined,
  LyricsOutlined,
} from '@mui/icons-material';
import { createClient } from '~/util/supabase/client';

const ACTIVE_ROUTE = 'flex items-center gap-3 py-2 px-4 mb-3 text-white bg-black rounded-md';
const INACTIVE_ROUTE = 'flex items-center gap-3 py-2 px-4 mb-3 text-black outline outline-3 bg-white hover:text-white hover:bg-black rounded-md';

interface User {
  email: string;
  // Add other properties as needed
}

interface SidebarLinkProps {
  href: string;
  Icon: SvgIconComponent;
  text: string;
  active: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-neo-purple p-4 text-white border-r-3 border-black">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/musephoria_logo_rounded.png"
          alt="Musephoria"
          width={120}
          height={120}
          priority
        />
      </div>

      <ul className="flex-grow space-y-2 text-white">
        <SidebarLink href="/site" Icon={HomeOutlined} text="Dashboard" active={pathname === '/Dashboard'} />
        <SidebarLink href="/site/SongEngine" Icon={LibraryMusicOutlined} text="Song Engine" active={pathname === '/SongEngine'} />
        <SidebarLink href="/site/Projects" Icon={BlurLinearOutlined} text="Projects" active={pathname === '/Projects'} />
        <SidebarLink href="/site/Feedback" Icon={LyricsOutlined} text="Feedback" active={pathname === '/Feedback'} />
        <SidebarLink href="/site/League" Icon={BarChartOutlined} text="League" active={pathname === '/League'} />
        <SidebarLink href="/site/Messages" Icon={ForumOutlined} text="Messages" active={pathname === '/Messages'} />
        <SidebarLink href="/site/Settings" Icon={SettingsOutlined} text="Settings" active={pathname === '/Settings'} />
      </ul>

      <div className="flex self-center py-2">
        {user?.email}
      </div>
    </div>
  );
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, Icon, text, active }) => {
  return (
    <Link href={href} passHref>
      <div className={active ? ACTIVE_ROUTE : INACTIVE_ROUTE}>
        <Icon className="h-6 w-6" />
        {text}
      </div>
    </Link>
  );
};
