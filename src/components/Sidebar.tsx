"use client";
import Link from "next/link";
import { SvgIconComponent } from '@mui/icons-material';
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  HomeOutlined, // Dashboard
  LibraryMusicOutlined, // Song Engine
  BlurLinearOutlined, // Projects
  ForumOutlined, // Messages
  SettingsOutlined, // Settings
  BarChartOutlined, // League
  LyricsOutlined, // Feedback
} from '@mui/icons-material';
import { UserButton, useUser } from "@clerk/nextjs";


const ACTIVE_ROUTE = "flex items-center gap-3 py-2 px-4 mb-3 text-white bg-black rounded-md";
const INACTIVE_ROUTE = "flex items-center gap-3 py-2 px-4 mb-3 text-black outline outline-3 bg-white hover:text-white hover:bg-black rounded-md";

interface SidebarLinkProps {
  href: string;
  Icon: SvgIconComponent; // This is the correct type for Material-UI icons
  text: string;
  active: boolean;
}

function AuthButton() {
    return (
        <div className="flex justify-center w-full">
            <UserButton afterSignOutUrl="/" 
              appearance={{
                elements: {
                  spacingUnit: 0,
                }
              }}
            />
        </div>
    )
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-neo-purple p-4 text-white border-r-3 border-black">
      <div className="flex flex-col items-center mb-6">
        <Image
          src='/musephoria_logo_rounded.png'
          alt={'Musephoria'}
          width={120}
          height={120}
        />
      </div>

      <ul className="flex-grow space-y-2 text-white">
        <SidebarLink href="/" Icon={HomeOutlined} text="Dashboard" active={pathname === "/Dashboard"} />
        <SidebarLink href="/SongEngine" Icon={LibraryMusicOutlined} text="Song Engine" active={pathname === "/SongEngine"} />
        <SidebarLink href="/Projects" Icon={BlurLinearOutlined} text="Projects" active={pathname === "/Projects"} />
        <SidebarLink href="/Feedback" Icon={LyricsOutlined} text="Feedback" active={pathname === "/Feedback"} />
        <SidebarLink href="/League" Icon={BarChartOutlined} text="League" active={pathname === "/League"} />
        <SidebarLink href="/Messages" Icon={ForumOutlined} text="Messages" active={pathname === "/Messages"} />
        <SidebarLink href="/Settings" Icon={SettingsOutlined} text="Settings" active={pathname === "/Settings"} />
      </ul>

      <AuthButton  />

      <div className="flex self-center py-2">
        {user.fullName}
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