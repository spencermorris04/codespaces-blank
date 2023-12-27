import React from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

      const response = await fetch('/api/addToQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...song, timestamp }), // Include the timestamp
      });

      if (response.ok) {
        toast.success('Song added to queue successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to add song to queue: ${errorText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error);
        toast.error(`Error adding song to queue: ${error.message}`);
      } else {
        console.error('An unknown error occurred:', error);
        toast.error('An unknown error occurred while adding song to queue');
      }
    }
  };

  return (
    <div>
      <button 
        className="bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4 px-8"
        onClick={handleUploadToQueue}
      >
        Add to Queue
      </button>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default UploadSongToQueue;
