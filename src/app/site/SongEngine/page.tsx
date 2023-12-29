"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import MusicPlayer from '../../../components/MusicPlayer';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { addPoints } from '../../store/slices/pointsSlice';
import { AppDispatch } from '../../store/store';
import { toast, ToastContainer } from 'react-toastify';

// Define your Song interface
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

const SongEngine = () => {
  const [feedback, setFeedback] = useState({
    productionFeedback: '',
    instrumentationFeedback: '',
    songwritingFeedback: '',
    vocalsFeedback: '',
    otherFeedback: ''
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const { userId, getToken } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedback(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSong || !userId) return;
  
    const token = await getToken();
    const submissionData = { ...feedback, r2Id: selectedSong.r2Id, reviewerUserId: userId, uploaderUserId: selectedSong.uploaderUserId };
  
    try {
      const feedbackResponse = await fetch('/api/uploadFeedbackForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData),
      });
  
      if (feedbackResponse.ok) {
        // Display the success notification here
        toast.success('Feedback submitted successfully');
  
        dispatch(addPoints({ userId, points: 100 }));
  
        // Remove the song from the queue
        await fetch('/api/removeFromQueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ r2Id: selectedSong.r2Id, timestamp: selectedSong.timestamp }),
        });
  
        // Fetch the next song
        await fetchSongDetails();
  
        // Reset feedback form
        setFeedback({
          productionFeedback: '',
          instrumentationFeedback: '',
          songwritingFeedback: '',
          vocalsFeedback: '',
          otherFeedback: ''
        });
      } else {
        console.error('Error submitting feedback:', await feedbackResponse.text());
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(`Error submitting feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  

  // Form input and label classes
  const inputClass = classNames(
    'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4',
    { 'animate-flash': loading }
  );
  const labelClass = 'block text-gray-700 text-sm font-bold mb-2';

  return (
    <div className="flex flex-row mx-4 h-[90vh] w-full">
    {/* Left Pane - Feedback Form */}
    <div className="flex-1 w-3/5 px-4 py-4 overflow-y-auto">
        <form onSubmit={handleSubmit} className="bg-neo-light-pink shadow-md rounded-lg outline outline-4 px-8 pt-6 pb-8 mb-4">
        {/* Production Feedback */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="productionFeedback">Production Feedback:</label>
          <textarea
            id="productionFeedback"
            name="productionFeedback"
            value={feedback.productionFeedback}
            onChange={handleInputChange}
            className={inputClass}
          />
        </div>

        {/* Instrumentation Feedback */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="instrumentationFeedback">Instrumentation Feedback:</label>
          <textarea
            id="instrumentationFeedback"
            name="instrumentationFeedback"
            value={feedback.instrumentationFeedback}
            onChange={handleInputChange}
            className={inputClass}
          />
        </div>

        {/* Songwriting Feedback */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="songwritingFeedback">Songwriting Feedback:</label>
          <textarea
            id="songwritingFeedback"
            name="songwritingFeedback"
            value={feedback.songwritingFeedback}
            onChange={handleInputChange}
            className={inputClass}
          />
        </div>

        {/* Vocals Feedback */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="vocalsFeedback">Vocals Feedback:</label>
          <textarea
            id="vocalsFeedback"
            name="vocalsFeedback"
            value={feedback.vocalsFeedback}
            onChange={handleInputChange}
            className={inputClass}
          />
        </div>

        {/* Other Feedback */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="otherFeedback">Other Feedback:</label>
          <textarea
            id="otherFeedback"
            name="otherFeedback"
            value={feedback.otherFeedback}
            onChange={handleInputChange}
            className={inputClass}
          />
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4">
          Submit Feedback
        </button>
      </form>
    

    {/* Right Pane - Song Details and Music Player */}
    <div className="flex-2 w-2/5 px-4 py-4 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg overflow-y-auto">
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
                <p className="mt-1 bg-white px-4 py-2 rounded-lg text-black whitespace-pre-wrap">{selectedSong.lyrics}</p>
              </div>
            </div>
            <div className="self-center flex">
              {/* Music Player */}
              <MusicPlayer key={selectedSong.id} songUrl={selectedSong.presignedUrl || ''} />
            </div>
          </>
        ) : (
          <div className="text-center">Loading song details...</div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SongEngine;
