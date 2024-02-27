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
        {/* You can place the edit button somewhere here and bind it with onEdit */}
        {/* Example: */}
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={(e) => {
          e.stopPropagation(); // Prevent onClick from being triggered when the edit button is clicked
          onEdit();
        }}>Edit</button>
      </div>
    </div>
  );
};

export default SongCard;
