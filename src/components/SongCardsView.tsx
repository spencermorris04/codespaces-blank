"use client";
import React, { useState, useEffect, useRef } from 'react';
import SongCard from '~/components/SongCard';
import MusicPlayer from '~/components/MusicPlayer';
import MobileMusicPlayer from '~/components/MobileMusicPlayer';
import UploadSongToQueue from '~/components/UploadSongToQueue';
import QuestionEditingModal from '~/components/QuestionEditingModal';

const isMobileDevice = () => {
  if (typeof window !== 'undefined') {
    return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  }
  return false;
};

const SongCardsView = ({ songs, loading }) => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = isMobileDevice();
  const listRef = useRef(null); // Define listRef using useRef

  const handleCardClick = (song) => {
    setSelectedSong(song);
  };

  const handleEditClick = () => {
    setIsEditing(true);
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

export default SongCardsView;
