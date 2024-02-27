import React from 'react';
import MusicPlayer from './MusicPlayer';

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

interface QuestionEditingModalProps {
  song: Song; // Use the Song interface you've defined
  onClose: () => void; // Function to close the modal
}

const QuestionEditingModal: React.FC<QuestionEditingModalProps> = ({ song, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white rounded-lg p-5 w-3/4 h-3/4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Edit Questions for {song.songTitle}</h2>
        <MusicPlayer songUrl={song.presignedUrl || ''} />
        <div className="flex justify-end mt-4">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditingModal;