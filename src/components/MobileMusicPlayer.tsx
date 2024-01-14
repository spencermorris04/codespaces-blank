import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';

interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  presignedUrl?: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
}

interface MobileMusicPlayerProps {
  song: Song;
}

const MobileMusicPlayer: React.FC<MobileMusicPlayerProps> = ({ song }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
  
    // Handler for general swipeable actions
    const handlers = useSwipeable({
      onSwipedUp: () => setIsExpanded(true),
      onSwipedDown: () => setIsExpanded(false),
      trackMouse: true,
      delta: 10
    });
  
    // Handler to prevent swipe actions on the lyrics section
    const lyricsHandlers = useSwipeable({
      onSwipedUp: (eventData) => eventData.event.stopPropagation(),
      onSwipedDown: (eventData) => eventData.event.stopPropagation(),
      trackMouse: true
    });
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };
  
    return (
    <div className="fixed bottom-0 left-0 right-0">
      {/* Chevron Icon */}
      <div className="flex justify-center cursor-pointer mb-1.5" onClick={toggleExpand}>
        <div className="rounded-full bg-gray-700 bg-opacity-50 p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={!isExpanded ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="p-1 rounded-t-lg bg-neo-light-pink outline outline-4 outline-top outline-left outline-right transition-all duration-300" style={{ height: isExpanded ? '75%' : 'auto' }} {...handlers}>
        <div className="flex justify-center items-center">
          <audio ref={audioRef} src={song.presignedUrl} controls autoPlay className="w-full" />
        </div>
        {isExpanded && (
          <div className="p-4 overflow-y-auto">
            <h2 className="text-center">{song.songTitle}</h2>
                <p><strong>Genre:</strong> {song.genre}</p>
                <p><strong>Instruments:</strong> {song.instruments}</p>
                <p><strong>Contribution:</strong> {song.contribution}</p>
                <p><strong>Description:</strong> {song.description}</p>
                <p {...lyricsHandlers} className="mt-1 bg-white px-4 py-2 rounded-lg text-black whitespace-pre-wrap h-[250px] overflow-y-scroll no-scrollbar">
                    {song.lyrics}
                </p>
                </div>
            )}
            </div>
        </div>
      );
};
  
export default MobileMusicPlayer;
