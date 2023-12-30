"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPoints, removePoints } from '../app/store/slices/pointsSlice';
import { RootState, AppDispatch } from '../app/store/store';

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
  const { userId, getToken } = useAuth();
  const dispatch = useDispatch<AppDispatch>(); // Use the AppDispatch type here
  const totalPoints = useSelector((state: RootState) => state.points.totalPoints);
  const costOfAddingToQueue = 200;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPoints(userId));
    }
  }, [userId, dispatch]);

  const handleUploadToQueue = async () => {
    if (!userId) {
      toast.error('User ID is not available.');
      return;
    }

    try {
      if (totalPoints < costOfAddingToQueue) {
        toast.error('You do not have enough points to add this song to the queue');
        return;
      }

      const token = await getToken();
      const timestamp = new Date().toISOString();
      const addToQueueResponse = await fetch('/api/addToQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...song, timestamp }),
      });

      if (addToQueueResponse.ok) {
        dispatch(removePoints({ userId, points: costOfAddingToQueue }));
        toast.success('Song added to queue successfully');
      } else {
        const errorText = await addToQueueResponse.text();
        throw new Error(`Failed to add song to queue: ${errorText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error adding song to queue: ${error.message}`);
      } else {
        toast.error('An unknown error occurred while adding song to queue');
      }
    }
  };

  return (
    <div>
      <button 
        className="bg-white hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded-xl outline outline-4"
        onClick={handleUploadToQueue}
      >
        Add to Queue
      </button>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default UploadSongToQueue;
