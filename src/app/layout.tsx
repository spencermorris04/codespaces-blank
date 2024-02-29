import type { Metadata } from 'next'
import { Public_Sans } from 'next/font/google'
import './globals.css'
import Sidebar from '~/components/Sidebar';

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
      <html lang="en">
        <body className={`${publicsans.className} flex relative h-screen`}>
          {/* Sidebar */}
          <div className="sidebar">
              <Sidebar />
          </div>
          
          {/* Main content area with Top Navbar */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 h-full overflow-y-auto bg-neo-light-cream">
              {children}
            </main>
          </div>

          {/* Animated GIF in the bottom right corner */}
          <div className="absolute bottom-0 right-0 mb-4 mr-4">
          </div>
        </body>
      </html>
  );
}