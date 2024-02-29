"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '~/util/supabase/client'
import MusicPlayer from '../../../components/MusicPlayer';
import SongCard from '../../../components/SongCard';
import UploadSongToQueue from '../../../components/UploadSongToQueue';
import MobileMusicPlayer from '../../../components/MobileMusicPlayer';
import QuestionEditingModal from '~/components/QuestionEditingModal';
import { usePathname, useRouter } from 'next/navigation';

interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  presignedUrl?: string;
  uploaderUserId: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
}

interface UrlData {
  objectKey: string;
  url: string;
}

const isMobileDevice = () => {
  // Check if the code is running in a browser environment
  if (typeof window !== 'undefined') {
    return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  }
  // Return false if not in a browser environment (e.g., server-side rendering)
  return false;
};

const ProjectsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const isMobile = isMobileDevice(); // Detect if the device is mobile
  const [userId, setUserId] = useState<string | null>(null); // Initialize userId state
  const router = useRouter(); // Use useRouter to handle redirects


  useEffect(() => {
    // Define the async function inside the useEffect
    async function fetchUserId() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
      } else {
        setUserId(data.user.id); // Set userId state
      }
    }

    fetchUserId(); // Call the function
  }, []); // Empty dependency array to run once on mount


  useEffect(() => {
    const fetchUserSongs = async () => {
      if (!userId) return;
      let userSongs: Song[] = []; // Declare userSongs here

      try {
        const response = await fetch('/api/getUserSongs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user songs');
        }

        userSongs = await response.json();
        setSongs(userSongs);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
      
      // Fetch presigned URLs for songs
      const r2Ids = userSongs.map(song => song.r2Id);
      const urlResponse = await fetch('/api/getR2SongUrls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objectKeys: r2Ids }),
      });

      
      if (urlResponse.ok) {
        const urlData: UrlData[] = await urlResponse.json();
        const songsWithUrls = userSongs.map((song) => ({
          ...song,
          presignedUrl: urlData.find((url: UrlData) => url.objectKey === song.r2Id)?.url
        }));
        setSongs(songsWithUrls);
      }
    };

    fetchUserSongs();

    // Function to check for overflow in the left pane
    const checkForOverflow = () => {
      if (listRef.current) {
        setShowScrollArrow(listRef.current.scrollHeight > listRef.current.clientHeight);
      }
    };

    // Call the function to check for overflow
    checkForOverflow();

    // Optional: Add an event listener to recheck overflow when the window is resized
    window.addEventListener('resize', checkForOverflow);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', checkForOverflow);
    };
}, [userId]);

  // State to manage modal visibility
  const [isEditing, setIsEditing] = useState(false);

  // Function to handle opening the modal
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCardClick = (song: Song) => {
    setSelectedSong(song);
  };

  if (loading) {
    return (
      <div className="flex h-[90vh] mx-4">
        {/* Left Pane - Dummy Song Cards */}
        <div className="relative flex-1 w-3/5">
          <div className="px-2 pt-2 overflow-y-auto no-scrollbar h-full">
            <div className="grid grid-cols-2 gap-y-5 gap-x-5 items-stretch">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col h-48 bg-gray-200 rounded-lg p-4 animate-flash">
                  {/* Dummy content with size similar to actual song cards */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane - Placeholder */}
        <div className="flex-2 w-2/5 ml-2 my-4 py-4 px-8 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg flex flex-col">
          <div className="text-center">Select a song to view details</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[90vh] mx-4">
        {/* Left Pane - List of Song Cards */}
        <div className="relative flex-1 w-3/5">
          <div ref={listRef} className="px-2 pt-2 overflow-y-auto no-scrollbar h-full">
            <div className="grid grid-cols-2 gap-y-0 gap-x-5 items-stretch mb-10">
              {songs.map((song) => (
                <div key={song.id} className="flex flex-col h-full">
                  <SongCard song={song} onEdit={() => handleEditClick()} onClick={() => handleCardClick(song)} />
                </div>
              ))}
            </div>
          </div>
          {/* Fade effects at the edges */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-neo-light-cream to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-4 pointer-events-none bg-gradient-to-t from-transparent to-neo-light-cream"></div>
        </div>

        {/* Right Pane - Song Details and Music Player for Non-Mobile Devices */}
        {!isMobile && (
          <div className="flex-2 w-2/5 ml-2 my-4 py-4 px-8 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg flex flex-col">
            {selectedSong ? (
          <>
            <h2 className="text-4xl mt-2 font-bold mb-6 text-center">{selectedSong.songTitle}</h2>
            <div className="flex-grow overflow-y-auto h-2/3">
              <div className="mb-2 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Genre:</strong> {selectedSong.genre}
              </div>
              <div className="mb-2 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Instruments:</strong> {selectedSong.instruments}
              </div>
              <div className="mb-2 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Contribution:</strong> {selectedSong.contribution}
              </div>
              <div className="mb-2 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Description:</strong>
                <p className="mt-1 bg-white px-4 py-2 rounded-lg text-black">{selectedSong.description}</p>
              </div>
              <div className="mb-2 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Lyrics:</strong>
                <p className="h-[250px] mt-1 bg-white px-4 py-2 rounded-lg text-black whitespace-pre-wrap overflow-y-scroll no-scrollbar">{selectedSong.lyrics}</p>
              </div>
            </div>
            <div className="self-center flex mt-4">
            <MusicPlayer key={selectedSong.id} songUrl={selectedSong.presignedUrl || ''} />
            </div>

                {/* UploadSongToQueue button */}
                <div className="mt-6 self-center">
                  <UploadSongToQueue song={selectedSong} />
                  <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleEditClick}>Edit</button>
                </div>
                
              </>
            ) : (
              <div className="text-center">Select a song to view details</div>
            )}
          </div>
        )}
      </div>

     {/* Mobile Music Player - Render for both cases */}
     {isMobile && (
        <div className="fixed bottom-0 left-0 right-0">
          {/* Render MobileMusicPlayer with selectedSong or an empty placeholder */}
          {selectedSong ? (
            <MobileMusicPlayer song={selectedSong} />
          ) : (
            <MobileMusicPlayer 
              song={{
                id: 0,
                songTitle: 'No song selected',
                r2Id: '',
                presignedUrl: '',
                genre: '',
                instruments: '',
                contribution: '',
                description: 'Select a song to view details.',
                lyrics: ''
              }}
            />
          )}
        </div>
      )}
      {isEditing && selectedSong && <QuestionEditingModal song={selectedSong} onClose={() => setIsEditing(false)} />}
    </>
  );
};

export default ProjectsPage;