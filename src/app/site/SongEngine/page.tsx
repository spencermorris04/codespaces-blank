"use client";
import React, { useState, useEffect, useCallback } from 'react';
import MusicPlayer from '~/components/MusicPlayer';
import { addPoints } from '../../store/slices/pointsSlice';
import { AppDispatch } from '../../store/store';
import { toast, ToastContainer } from 'react-toastify';
import QuestionForm from '~/components/QuestionForm';
import EndOfSongQuestionForm from '~/components/EndOfSongQuestionForm';
import MobileMusicPlayer from '~/components/MobileMusicPlayer';
import { MobileFeedbackForm, getCurrentFeedback, resetCurrentFeedback } from '~/components/MobileFeedbackForm';
import { useSwipeable } from 'react-swipeable';
import { useDispatch, useSelector } from 'react-redux';
import { updateFeedback, resetFeedback } from '~/app/store/slices/feedbackSlice';
import { RootState } from '~/app/store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '~/util/supabase/client'

interface TimedQuestion {
  timestamp: string;
  question: string;
}

interface Question {
  question: string;
}

interface SongEngineState {
  loading: boolean;
  song: Song | null;
  currentQuestion: TimedQuestion | null;
  answers: { [key: string]: string };
  songEnded: boolean;
  timedQuestions: TimedQuestion[];
  endOfSongQuestions: Question[];
}

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
  timedQuestions: TimedQuestion[];
  endOfSongQuestions: Question[];
}

interface UrlData {
  objectKey: string;
  url: string;
}

const isMobileDevice = () => {
  // Check if the code is running in a browser environment
  if (typeof window !== 'undefined') {
    return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  }
  // Return false if not in a browser environment (e.g., server-side rendering)
  return false;
};

const SongEngine: React.FC = () => {
  const [state, setState] = useState<SongEngineState>({
    loading: true,
    song: null,
    currentQuestion: null,
    answers: {},
    songEnded: false,
    timedQuestions: [],
    endOfSongQuestions: [],
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null); // Initialize userId state
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Define the async function inside the useEffect
    async function fetchUserId() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
      } else {
        setUserId(data.user.id); // Set userId state
      }
    }

    fetchUserId(); // Call the function
  }, []); // Empty dependency array to run once on mount

  const currentFeedback = useSelector((state: RootState) => state.feedback);

    // Function to submit feedback
    const submitFeedback = async () => {
      if (!selectedSong || !userId) return;
  
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

  const fetchSongDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/getOldestSongFromQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          },
          body: JSON.stringify({ objectKeys: [songData.r2Id] }),
        });

        if (urlResponse.ok) {
          const urlData: UrlData[] = await urlResponse.json();
          songData.presignedUrl = urlData.find((url: UrlData) => url.objectKey === songData.r2Id)?.url;
          setSelectedSong(songData);
          setIsSongPlaying(true);
          setState((prevState) => ({
            ...prevState,
            timedQuestions: songData.timedQuestions || [],
            endOfSongQuestions: songData.endOfSongQuestions || [],
          }));
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
  }, [userId]);

  useEffect(() => {
    fetchSongDetails();
  }, [fetchSongDetails]);

  const handleTimestampReached = (timestamp: string, question: string) => {
    setState((prevState) => ({
      ...prevState,
      currentQuestion: { timestamp, question },
    }));
  };

  const handleAnswerSubmit = (answer: string) => {
    setState((prevState) => {
      const { currentQuestion, answers } = prevState;
      if (!currentQuestion) return prevState;
  
      const updatedAnswers = {
        ...answers,
        [currentQuestion.question]: answer,
      };
  
      const nextQuestionIndex = prevState.timedQuestions.findIndex(
        (q) => q.timestamp === currentQuestion.timestamp
      ) + 1;
  
      if (nextQuestionIndex < prevState.timedQuestions.length) {
        return {
          ...prevState,
          currentQuestion: prevState.timedQuestions[nextQuestionIndex],
          answers: updatedAnswers,
        };
      } else {
        return {
          ...prevState,
          currentQuestion: null,
          answers: updatedAnswers,
          songEnded: true,
        };
      }
    });
  };

  const handleEndOfSongAnswersSubmit = async (answers: { [key: string]: string }) => {
    if (!state.song) return;
  
    const submissionData = {
      reviewerUserId: userId,
      uploaderUserId: state.song.uploaderUserId,
      r2Id: state.song.r2Id,
      answers: {
        ...state.answers,
        ...answers,
      },
    };
  
    try {
      const response = await fetch('/api/uploadFeedbackForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
  
      // Dispatch points after successful removal
      dispatch(addPoints({ userId, points: 100 }));
  
      // Fetch next song details
      fetchSongDetails();
    } catch (error) {
      console.error('Error in song removal or fetching next song:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }; // Removed extra closing bracket here
  

  return (
    <div className="flex flex-row mx-4 mt-3 h-[90vh]">
      {/* Left Pane - Question Form */}
      <div className="flex-1 w-3/5 px-4 py-4 overflow-y-auto">
        {selectedSong && (
          <>
            {state.currentQuestion && (
              <QuestionForm
                question={state.currentQuestion.question}
                onAnswerSubmit={handleAnswerSubmit}
                isLastQuestion={
                  state.timedQuestions.findIndex(
                    (q) => q.timestamp === state.currentQuestion?.timestamp
                  ) ===
                  state.timedQuestions.length - 1
                }
              />
            )}
            {state.songEnded && state.endOfSongQuestions.length > 0 && (
              <EndOfSongQuestionForm
                questions={state.endOfSongQuestions}
                onAnswersSubmit={handleEndOfSongAnswersSubmit}
              />
            )}
          </>
        )}
      </div>
  
      {/* Right Pane - Song Details and Music Player */}
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
              <MusicPlayer
                key={selectedSong.id}
                songUrl={selectedSong.presignedUrl || ''}
                timedQuestions={state.timedQuestions}
                onTimestampReached={handleTimestampReached}
              />
            </div>
          </>
        ) : (
          <div className="text-center">Loading song details...</div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default SongEngine;