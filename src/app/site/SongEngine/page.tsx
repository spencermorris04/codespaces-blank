"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import MusicPlayer from '~/components/MusicPlayer';
import { addPoints } from '../../store/slices/pointsSlice';
import { AppDispatch } from '../../store/store';
import { toast, ToastContainer } from 'react-toastify';
import FeedbackForm from '~/components/FeedbackForm';
import MobileMusicPlayer from '~/components/MobileMusicPlayer';
import { MobileFeedbackForm, getCurrentFeedback, resetCurrentFeedback } from '~/components/MobileFeedbackForm';
import { useSwipeable } from 'react-swipeable';
import { useDispatch, useSelector } from 'react-redux';
import { updateFeedback, resetFeedback } from '~/app/store/slices/feedbackSlice';
import { RootState } from '~/app/store/store';
import { motion, AnimatePresence } from 'framer-motion';


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
  timestamp: string;
}

interface UrlData {
  objectKey: string;
  url: string;
}

interface SongEngineState {
  loading: boolean;
  song: Song | null;
}


const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const SongEngine = () => {
  const [state, setState] = useState<SongEngineState>({ loading: true, song: null });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const { userId, getToken } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = isMobileDevice();

  const [isSwiping, setIsSwiping] = useState(false);


  const currentFeedback = useSelector((state: RootState) => state.feedback);

    // Function to submit feedback
    const submitFeedback = async () => {
      if (!selectedSong || !userId) return;
  
      const token = await getToken();
      const submissionData = {
        ...currentFeedback,
        r2Id: selectedSong.r2Id,
        reviewerUserId: userId,
        uploaderUserId: selectedSong.uploaderUserId,
      };
  
    
      try {
        const response = await fetch('/api/uploadFeedbackForm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        });
    
        if (!response.ok) {
          throw new Error('Feedback submission failed');
      }

      toast.success('Feedback submitted successfully');
      dispatch(resetFeedback()); // Reset feedback in Redux store
      onFeedbackSubmitted();
    } catch (error) {
      toast.error(`Error submitting feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSwipeUp = async () => {
    if (isMobile && selectedSong) {
      setIsSwiping(true);
      await submitFeedback();
      // Trigger the animation to swipe up
    }
  };

    const swipeHandlers = useSwipeable({
        onSwipedUp: handleSwipeUp,
        trackMouse: true // Optional, based on your requirement
    }); 

  const fetchSongDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/getOldestSongFromQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch the oldest song from queue: ${response.statusText}`);
      }

      const [songData] = await response.json();
      if (songData) {
        const urlResponse = await fetch('/api/getR2SongUrls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ objectKeys: [songData.r2Id] }),
        });

        if (urlResponse.ok) {
          const urlData: UrlData[] = await urlResponse.json();
          songData.presignedUrl = urlData.find((url: UrlData) => url.objectKey === songData.r2Id)?.url;
          setSelectedSong(songData);
          setIsSongPlaying(true);
        }
      } else {
        setSelectedSong(null);
        setIsSongPlaying(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    fetchSongDetails();
  }, [fetchSongDetails]);

  const onFeedbackSubmitted = async () => {
    if (selectedSong && userId) {
      try {
        const token = await getToken();
        // Remove the song from the queue
        const removeResponse = await fetch('/api/removeFromQueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ r2Id: selectedSong.r2Id, timestamp: selectedSong.timestamp }),
        });

        if (!removeResponse.ok) {
          throw new Error('Failed to remove song from queue');
        }

        // Dispatch points after successful removal
        dispatch(addPoints({ userId, points: 100 }));

        // Fetch next song details
        fetchSongDetails();
      } catch (error) {
        console.error('Error in song removal or fetching next song:', error);
        toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    if (isSwiping) {
      // When swipe animation starts, fetch the next song
      fetchSongDetails().then(() => {
        setIsSwiping(false); // Reset the swipe state once the song is loaded
      });
    }
  }, [isSwiping, fetchSongDetails]);

  // Framer Motion animation variants for swipe up
  const variants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '-100%' },
  };

  return (
    <div className="flex flex-row mx-4 mt-3 h-[90vh]" {...swipeHandlers}>
      {/* Left Pane - Feedback Form */}
      {/* Conditional rendering for FeedbackForm based on device type */}
      <div className="flex-1 w-3/5 px-4 py-4 overflow-y-auto">
        {selectedSong && (
          isMobile
          ? <MobileFeedbackForm selectedSong={selectedSong} onFeedbackSubmitted={onFeedbackSubmitted} submitFeedback={submitFeedback} />
          : <FeedbackForm selectedSong={selectedSong} onFeedbackSubmitted={onFeedbackSubmitted} />
        )}
      </div>
  
      {/* Right Pane - Song Details and Music Player */}
      {isMobile ? (
          selectedSong && <MobileMusicPlayer song={selectedSong} />
        ) : (
          <div className="flex-2 w-2/5 px-4 py-4 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg overflow-y-auto items-center">
            {selectedSong ? (
              <>
                <h2 className="text-4xl mt-2 font-bold mb-6 text-center">{selectedSong.songTitle}</h2>
                <div className="overflow-y-auto">
                  {/* Display song details */}
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
                    <p className="mt-1 bg-white px-4 py-2 rounded-lg text-black whitespace-pre-wrap h-[250px] overflow-y-scroll no-scrollbar">{selectedSong.lyrics}</p>
                  </div>
                </div>
                <div className="self-center flex">
                  <MusicPlayer key={selectedSong.id} songUrl={selectedSong.presignedUrl || ''} />
                </div>
              </>
            ) : (
              <div className="text-center">Loading song details...</div>
            )}
          </div>
        )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default SongEngine;