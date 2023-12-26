"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import MusicPlayer from '../../components/MusicPlayer';
import SongCard from '../../components/SongCard';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';

// Define your Song interface (as before)
interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  presignedUrl?: string; // Add this property
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

const ProjectsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId, getToken } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    const fetchUserSongs = async () => {
      if (!userId) return;
      let userSongs: Song[] = []; // Declare userSongs here

      try {
        const token = await getToken();
        const response = await fetch('/api/getUserSongs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
      const token = await getToken();
      const urlResponse = await fetch('/api/getR2SongUrls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
}, [userId, getToken]);

  

  const handleCardClick = (song: Song) => {
    setSelectedSong(song);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-[90vh] mx-4">
      {/* Left Pane - List of Song Cards */}
      <div className="relative flex-1 w-3/5">
        <div ref={listRef} className="px-2 pt-2 overflow-y-auto no-scrollbar h-full">
          <div className="grid grid-cols-2 gap-y-0 gap-x-5 items-stretch">
            {songs.map((song) => (
              <div key={song.id} className="flex flex-col h-full">
                <SongCard song={song} onClick={() => handleCardClick(song)} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-30 pointer-events-none bg-gradient-to-t from-neo-light-cream to-transparent"></div> {/* Fade effect */}
        <div className="absolute top-0 left-0 right-0 h-4 pointer-events-none bg-gradient-to-t from-transparent to-neo-light-cream"></div> {/* Fade effect */}
      </div>

      {/* Right Pane - Song Details and Music Player */}
      <div className="flex-2 w-2/5 ml-2 my-4 py-4 px-8 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg flex flex-col">
        {selectedSong ? (
          <>
            <h2 className="text-4xl mt-2 font-bold mb-6 text-center">{selectedSong.songTitle}</h2>
            <div className="flex-grow overflow-y-auto">
              <div className="mb-4 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Genre:</strong> {selectedSong.genre}
              </div>
              <div className="mb-4 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Instruments:</strong> {selectedSong.instruments}
              </div>
              <div className="mb-4 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Contribution:</strong> {selectedSong.contribution}
              </div>
              <div className="mb-4 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Description:</strong>
                <p className="mt-2 bg-white px-4 py-2 rounded-lg text-black">{selectedSong.description}</p>
              </div>
              <div className="mb-4 bg-neo-light-pink px-4 py-2 rounded-lg text-black">
                <strong>Lyrics:</strong>
                <p className="mt-2 bg-white px-4 py-2 rounded-lg text-black whitespace-pre-wrap">{selectedSong.lyrics}</p>
              </div>
            </div>
            <MusicPlayer key={selectedSong.id} songUrl={selectedSong.presignedUrl || ''} />
          </>
        ) : (
          <div className="text-center">Select a song to view details</div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
