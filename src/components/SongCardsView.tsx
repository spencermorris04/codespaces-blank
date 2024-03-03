"use client";
import React, { useState, useEffect, useRef } from 'react';
import SongCard from '~/components/SongCard';
import MusicPlayer from '~/components/MusicPlayer';
import MobileMusicPlayer from '~/components/MobileMusicPlayer';
import UploadSongToQueue from '~/components/UploadSongToQueue';
import QuestionEditingModal from '~/components/QuestionEditingModal';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

const isMobileDevice = () => {
  if (typeof window !== 'undefined') {
    return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  }
  return false;
};

const SongCardsView = ({ songs, loading, title }) => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = isMobileDevice();
  const listRef = useRef(null); // Define listRef using useRef

  const filteredSongs = songs.filter(song => song.songTitle.toLowerCase().includes(title.toLowerCase()));

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
 
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('title', term);
    } else {
      params.delete('title');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  const handleCardClick = (song) => {
    setSelectedSong(song);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Function to handle the save action from QuestionEditingModal
  const handleSave = async (updatedSong) => {
    try {
      const response = await fetch('/api/updateSong', { // Ensure this URL matches your API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSong),
      });

      if (!response.ok) throw new Error('Failed to update song');

      const data = await response.json();
      toast.success(data.message); // Notify user of success
      setIsEditing(false); // Close modal on success
      // Optionally, refresh the song list to reflect the updated details
    } catch (error) {
      console.error('Error updating song:', error);
      toast.error('Error updating song');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[90vh] mx-4">
        <div className="flex-1 w-3/5">
          {/* Placeholder for loading state */}
          <div className="px-2 pt-2 overflow-y-auto no-scrollbar h-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col h-48 bg-gray-200 rounded-lg p-4 animate-flash"></div>
            ))}
          </div>
        </div>
        <div className="flex-2 w-2/5 ml-2 my-4 py-4 px-8 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg flex flex-col">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[85vh] mx-4">
        {/* Left Pane - List of Song Cards */}
        <div className="relative flex-1 w-3/5 mt-2">
          <div ref={listRef} className="px-2 pt-2 overflow-y-auto no-scrollbar h-full">
          <div className="relative flex flex-1 flex-shrink-0">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <input
              className="peer block w-full rounded-md outline outline-3 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              placeholder="enter your seach term here"
              defaultValue={searchParams.get('query')?.toString()}
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
            />
          </div>
            <div className="grid grid-cols-2 gap-y-0 gap-x-5 items-stretch mb-10">
              {filteredSongs.map((song) => (
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
                <div className="flex-grow overflow-y-auto no-scrollbar">
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
                  {/* Pass seekForwardDenial prop with value true */}
                  <MusicPlayer key={selectedSong.id} songUrl={selectedSong.presignedUrl || ''} seekForwardDenial={false} />
                </div>

                {/* UploadSongToQueue button and Edit Button */}
                <div className="mt-6 self-center flex">
                  <UploadSongToQueue song={selectedSong} />
                  <button className="ml-4 bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4" onClick={handleEditClick}>Edit</button>
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
      {isEditing && selectedSong && (
        <QuestionEditingModal
          song={selectedSong}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
      </>
  );
};

export default SongCardsView;
