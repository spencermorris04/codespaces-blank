import React from 'react';
import { useAuth } from '@clerk/nextjs';

interface UploadSongToQueueProps {
  song: {
    songTitle: string;
    r2Id: string;
    uploaderUserId: string;
    genre: string;
    instruments: string;
    contribution: string;
    description: string;
    lyrics: string;
  };
}

const UploadSongToQueue: React.FC<UploadSongToQueueProps> = ({ song }) => {
  const { getToken } = useAuth();

  const handleUploadToQueue = async () => {
    try {
      const token = await getToken();
      const timestamp = new Date().toISOString(); // Generate timestamp

      // Log the timestamp for debugging
      console.log('Timestamp being sent:', timestamp);

      // Ensure the timestamp is a valid ISO string
      if (!timestamp || new Date(timestamp).toString() === 'Invalid Date') {
        throw new Error('Invalid timestamp');
      }

      const response = await fetch('/api/addToQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...song, timestamp }), // Include the timestamp
      });

      if (response.ok) {
        alert('Song added to queue successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to add song to queue: ${errorText}`);
      }
    } catch (error) {
        if (error instanceof Error) {
          console.error('Error:', error);
          alert(`Error adding song to queue: ${error.message}`);
        } else {
          console.error('An unknown error occurred:', error);
          alert('An unknown error occurred while adding song to queue');
        }
      }
    };

  return (
    <button 
      className="bg-neo-yellow hover:bg-blue-700 text-black font-bold py-2 px-4 rounded-xl outline outline-4 outline-neo-orange px-8"
      onClick={handleUploadToQueue}
    >
      Add to Queue
    </button>
  );
};

export default UploadSongToQueue;
