import React from 'react';

interface Question {
  timestamp: string;
  question: string;
}

interface Song {
  id?: number; // Optional because it's not used everywhere
  r2Id: string;
  songTitle: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
  presignedUrl: string;
  questions: Question[]; // Updated to reflect a structure for the questions
  uploaderUserId: string;
}

interface SongCardProps {
  song: Song;
  onClick: () => void; // This prop is for selecting the song
  onEdit: () => void; // This prop is for editing the song
}

const SongCard: React.FC<SongCardProps> = ({ song, onClick, onEdit }) => {
  return (
    <div className="h-full cursor-pointer">
      <div className="song-card flex-grow outline outline-3 bg-neo-light-pink rounded-md mb-4 mt-2 p-4" onClick={onClick}> {/* Attach the onClick prop here */}
        <h3 className="font-bold mb-4 text-center text-2xl">{song.songTitle}</h3>
        <p>Genre: {song.genre}</p>
        <p>Instruments: {song.instruments}</p>
        <p>Contribution: {song.contribution}</p>
      </div>
    </div>
  );
};

export default SongCard;
