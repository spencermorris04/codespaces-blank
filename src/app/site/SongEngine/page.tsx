"use client";
// SongEngine.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addPoints } from '../../store/slices/pointsSlice';
import { AppDispatch } from '../../store/store';
import { toast, ToastContainer } from 'react-toastify';
import QuestionForm from '~/components/QuestionForm';
import EndOfSongQuestionForm from '~/components/EndOfSongQuestionForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateFeedback, resetFeedback } from '~/app/store/slices/feedbackSlice';
import { RootState } from '~/app/store/store';
import { createClient } from '~/util/supabase/client';
import FeedbackMusicPlayer from '~/components/FeedbackMusicPlayer';
import { selectCurrentTime } from '~/app/store/selectors/musicPlayerSelectors';

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
  vocalsStart: number | null;
  vocalsEnd: number | null;
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
  timedQuestions: string; // Changed to string type
  endOfSongQuestions: string; // Changed to string type
  vocalsStart: number;
  vocalsEnd: number;
}

interface UrlData {
  objectKey: string;
  url: string;
}

const SongEngine: React.FC = () => {
  const [state, setState] = useState<SongEngineState>({
    loading: true,
    song: null,
    currentQuestion: null,
    answers: {},
    songEnded: false,
    timedQuestions: [],
    endOfSongQuestions: [],
    vocalsStart: 0,
    vocalsEnd: 100,
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTime = useSelector(selectCurrentTime);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const loadSongRef = useRef<(url: string) => void | null>(null);

  const handleCanPlay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Autoplay error:', error);
      });
    }
  }, []);

  useEffect(() => {
    async function fetchUserId() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
      } else {
        setUserId(data.user.id);
      }
    }

    fetchUserId();
  }, []);

  const getTimeUntilNextQuestion = () => {
    if (state.currentQuestion) return null;

    const nextQuestion = state.timedQuestions.find((q) => Number(q.timestamp) > currentTime);

    if (nextQuestion) {
      const timeUntilNext = Number(nextQuestion.timestamp) - currentTime;
      return `The next question is in ${Math.ceil(timeUntilNext)} seconds...`;
    } else {
      const timeUntilEnd = (audioRef.current?.duration || 0) - currentTime;
      return `The song will end in ${Math.ceil(timeUntilEnd)} seconds...`;
    }
  };

  const currentFeedback = useSelector((state: RootState) => state.feedback);

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
      dispatch(resetFeedback());
      fetchSongDetails();
    } catch (error) {
      toast.error(`Error submitting feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchSongDetails = useCallback(async () => {
    setLoading(true);
    console.log("Starting to fetch song details");
    try {
      const response = await fetch('/api/getOldestSongFromQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      console.log("Received response from API");
  
      if (!response.ok) {
        throw new Error(`Failed to fetch the oldest song from queue: ${response.statusText}`);
      }
  
      const [songData] = await response.json();
      console.log("Parsed JSON from API response:", songData);
  
      if (songData) {
        console.log("Fetching presigned URL for the song");
        const urlResponse = await fetch('/api/getR2SongUrls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ objectKeys: [songData.r2Id] }),
        });
  
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          const presignedUrl = urlData.find((url: UrlData) => url.objectKey === songData.r2Id)?.url;
          console.log("Presigned URL:", presignedUrl);
  
          // Update the songData object with the presigned URL
          songData.presignedUrl = presignedUrl;
  
          // Logging to verify the vocalsStart and vocalsEnd before state update
          console.log("vocalsStart from API:", songData.vocalsStart);
          console.log("vocalsEnd from API:", songData.vocalsEnd);
  
          // Attempt to parse endOfSongQuestions if it's a string
          let parsedEndOfSongQuestions: Question[] = [];
          try {
            if (typeof songData.endOfSongQuestions === 'string') {
              console.log("Parsing endOfSongQuestions from string");
              parsedEndOfSongQuestions = JSON.parse(songData.endOfSongQuestions).map((question: string) => ({ question }));
            } else {
              console.log("Using endOfSongQuestions as it is");
              parsedEndOfSongQuestions = songData.endOfSongQuestions.map((question: string) => ({ question }));
            }
          } catch (error) {
            console.error('Error parsing endOfSongQuestions:', error);
          }

          // Update the songData object with parsed data
          songData.timedQuestions = songData.timedQuestions || [];
          songData.endOfSongQuestions = parsedEndOfSongQuestions;

          return songData;
        } else {
          console.error("Failed to fetch presigned URL");
        }
      } else {
        console.log("No song data found");
        return null;
      }
    } catch (error) {
      console.error('Error fetching song details:', error);
    } finally {
      setLoading(false);
      console.log("Finished fetching song details");
    }
  }, [userId]);
  
  useEffect(() => {
    const fetchData = async () => {
      const songData = await fetchSongDetails();
      setSelectedSong(songData);

      if (songData) {
        setState((prevState) => ({
          ...prevState,
          timedQuestions: songData.timedQuestions || [],
          endOfSongQuestions: songData.endOfSongQuestions || [],
          vocalsStart: songData.vocalsStart,
          vocalsEnd: songData.vocalsEnd,
        }));
      }
    };

    fetchData();
  }, [fetchSongDetails]);

  const handleTimestampReached = (timestamp: string, question: string) => {
    setState((prevState) => ({
      ...prevState,
      currentQuestion: { timestamp, question },
    }));

    // Pause the audio when a timed question is reached
    const audio = audioRef.current;
    if (audio) audio.pause();
  };

  const handleAnswerSubmit = (answer: string) => {
    setState((prevState) => {
      const { currentQuestion, answers } = prevState;
      if (!currentQuestion) return prevState;

      const updatedAnswers = {
        ...answers,
        [currentQuestion.question]: answer,
      };

      return {
        ...prevState,
        currentQuestion: null,
        answers: updatedAnswers,
      };
    });

    // Resume playback
    const audio = audioRef.current;
    if (audio) audio.play();
  };

  useEffect(() => {
    const checkTimestamps = () => {
      const timestamp = currentTime.toFixed(6);
      const matchingQuestion = state.timedQuestions.find((q) => q.timestamp === timestamp);
      if (matchingQuestion) {
        setState((prevState) => ({
          ...prevState,
          currentQuestion: { timestamp, question: matchingQuestion.question },
        }));

        // Pause the audio when a timed question is reached
        const audio = audioRef.current;
        if (audio) audio.pause();
      }
    };

    checkTimestamps();
  }, [currentTime, state.timedQuestions]);

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
      if (userId) {
        dispatch(addPoints({ userId, points: 100 }));
      }

      // Fetch next song details
      fetchSongDetails();
    } catch (error) {
      console.error('Error in song removal or fetching next song:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLyricsScroll = () => {
    const lyricsContainer = lyricsContainerRef.current;
    if (lyricsContainer && audioRef.current && selectedSong) {
      const { vocalsStart, vocalsEnd } = selectedSong;
      const vocalsDuration = vocalsEnd - vocalsStart;
      const scrollRatio = Math.max(0, Math.min((currentTime - vocalsStart) / vocalsDuration, 1));
      const scrollHeight = lyricsContainer.scrollHeight - lyricsContainer.clientHeight;
  
      console.log('vocalsStart:', vocalsStart);
      console.log('vocalsEnd:', vocalsEnd);
      console.log('vocalsDuration:', vocalsDuration);
      console.log('scrollRatio:', scrollRatio);
      console.log('scrollHeight:', scrollHeight);
  
      lyricsContainer.scrollTop = scrollRatio * scrollHeight;
    }
  };

  useEffect(() => {
    handleLyricsScroll();
  }, [currentTime, selectedSong]);

  useEffect(() => {
    if (selectedSong && selectedSong.presignedUrl && loadSongRef.current) {
      loadSongRef.current(selectedSong.presignedUrl);

      const autoplay = async () => {
        try {
          await new Promise((resolve) => {
            if (audioRef.current?.readyState === 4) {
              resolve(true);
            } else {
              audioRef.current?.addEventListener('canplaythrough', resolve);
            }
          });
          await audioRef.current?.play();
        } catch (error) {
          console.error('Autoplay error:', error);
        }
      };

      autoplay();

      return () => {
        audioRef.current?.removeEventListener('canplaythrough', autoplay);
      };
    }
  }, [selectedSong]);

  const handleAudioRef = (ref: React.RefObject<HTMLAudioElement>) => {
    audioRef.current = ref.current;
  };

  return (
    <div className="flex flex-col py-4 h-full">
      <div className="flex-1 flex">
        {/* Left Pane - Question Form and Music Player */}
        <div className="w-2/3 flex flex-col mr-4 ml-4">
          <div className="flex-1 px-4 py-4 overflow-y-auto bg-white outline outline-black outline-4 rounded-lg">
            {state.currentQuestion ? (
              <QuestionForm
                question={state.currentQuestion.question}
                onAnswerSubmit={handleAnswerSubmit}
                isLastQuestion={false}
              />
            ) : (
              <div>{getTimeUntilNextQuestion()}</div>
            )}
            {state.songEnded && state.endOfSongQuestions.length > 0 && (
              <EndOfSongQuestionForm
                questions={state.endOfSongQuestions}
                onAnswersSubmit={handleEndOfSongAnswersSubmit}
              />
            )}
          </div>
          {selectedSong && selectedSong.presignedUrl && (
            <div className="mt-4">
              <FeedbackMusicPlayer
                key={selectedSong.id}
                songUrl={selectedSong.presignedUrl}
                timedQuestions={state.timedQuestions}
                onTimestampReached={handleTimestampReached}
                onEnded={() => setState((prevState) => ({ ...prevState, songEnded: true }))}
                seekForwardDenial={true}
                onAudioRef={handleAudioRef}
                onCanPlay={handleCanPlay}
              />
            </div>
          )}
        </div>

        {/* Right Pane - Song Details */}
        <div className="w-1/3 px-4 py-4 mr-4 bg-black outline outline-2 outline-black text-neo-light-pink rounded-lg shadow-lg overflow-y-auto">
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
                  <div
                    ref={lyricsContainerRef}
                    className="lyrics-container mt-1 bg-white px-4 py-2 rounded-lg text-black whitespace-pre-wrap h-[200px] overflow-y-scroll no-scrollbar"
                  >
                    {selectedSong.lyrics}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">Loading song details...</div>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default SongEngine;