import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Public_Sans } from 'next/font/google'
import './globals.css'
import Sidebar from '~/components/Sidebar';
import TopNavbar from '~/components/TopNavbar';
import {neobrutalism} from "@clerk/themes";

const publicsans = Public_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Musephoria',
  description: 'A Social Media for Musicians',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: neobrutalism
      }}
    >
      <html lang="en">
      <body className={`${publicsans.className} flex relative`}>
          {/* Sidebar */}
          <div className="flex-none border-r-4 border-black">
            <Sidebar />
          </div>
          
          {/* Main content area with Top Navbar */}
          <div className="flex-1 flex flex-col min-h-screen">
            <div className="border-b-4 border-black">
             <TopNavbar />
            </div>
            <main className="flex-1 overflow-auto bg-neo-light-cream">
              {children}
            </main>
          </div>

          {/* Animated GIF in the bottom right corner */}
          <div className="absolute bottom-0 right-0 mb-4 mr-4">
            <img 
              src="https://cdn.7tv.app/emote/62f56f44971f4d663eb618ba/4x.gif" 
              alt="Animated Emote" 
              style={{ width: '150px', height: '150px' }}
            />
          </div>
      </body>
      </html>
    </ClerkProvider>
  )
}
