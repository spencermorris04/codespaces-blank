import React from 'react';

// Define the Song interface
interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  uploaderUserId: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
}

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onClick }) => {
  return (
    <div className="h-full">
    <div className="song-card flex-grow  outline outline-3 bg-neo-light-pink rounded-md mb-4 mt-2 p-4" onClick={onClick}>
      <h3 className="text-xl font-bold mb-4 text-center text-2xl">{song.songTitle}</h3>
      <p>Genre: {song.genre}</p>
      <p>Instruments: {song.instruments}</p>
      <p>Contribution: {song.contribution}</p>
    </div>
    </div>
  );
};

export default SongCard;
