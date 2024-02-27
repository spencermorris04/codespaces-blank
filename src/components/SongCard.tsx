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
  onEdit: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onEdit }) => {
  return (
    <div className="h-full">
      <div className="song-card flex-grow outline outline-3 bg-neo-light-pink rounded-md mb-4 mt-2 p-4" onClick={onEdit}> {/* Use onEdit here if you want the entire card to be clickable */}
        <h3 className="font-bold mb-4 text-center text-2xl">{song.songTitle}</h3>
        <p>Genre: {song.genre}</p>
        <p>Instruments: {song.instruments}</p>
        <p>Contribution: {song.contribution}</p>
        {/* Optionally, add a specific button for editing */}
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="edit-button">
          Edit
        </button>
      </div>
    </div>
  );
};


export default SongCard;
