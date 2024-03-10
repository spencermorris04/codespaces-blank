// FeedbackMusicPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTime, setMaxWatchedTime, setDuration as setDurationAction } from '~/app/store/slices/musicPlayerSlice';
import { selectMaxWatchedTime } from '~/app/store/selectors/musicPlayerSelectors';
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeUp } from 'react-icons/fa';
import '~/app/styles/MusicPlayer.css';

interface TimedQuestion {
  timestamp: string;
  question: string;
}

interface FeedbackMusicPlayerProps {
  videoSources: { [key: string]: string };
  songUrl: string;
  onEnded?: () => void;
  onTimestampReached?: (timestamp: string, question: string) => void;
  timedQuestions: TimedQuestion[];
  seekForwardDenial?: boolean;
  onAudioRef?: (ref: React.RefObject<HTMLAudioElement>) => void;
  onCanPlay?: () => void;
}

const FeedbackMusicPlayer: React.FC<FeedbackMusicPlayerProps> = ({
  songUrl,
  onEnded,
  onTimestampReached,
  seekForwardDenial = true,
  timedQuestions,
  onAudioRef,
  onCanPlay,
  videoSources,
}) => {
  const dispatch = useDispatch();
  const maxWatchedTime = useSelector(selectMaxWatchedTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeLocal] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const sortedTimedQuestions = React.useMemo(() => timedQuestions.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp)), [timedQuestions]);
  const [nextQuestionIndex, setNextQuestionIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (onAudioRef) {
      onAudioRef(audioRef);
    }
  }, [onAudioRef]);

  const toggleVolumeSlider = () => setShowVolumeSlider(!showVolumeSlider);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setCurrentTimeLocal(currentTime);
      dispatch(setCurrentTime(currentTime));

      if (currentTime > maxWatchedTime) {
        dispatch(setMaxWatchedTime(currentTime));
      }

      if (nextQuestionIndex < sortedTimedQuestions.length) {
        const nextQuestion = sortedTimedQuestions[nextQuestionIndex];
        if (audio.currentTime >= parseFloat(nextQuestion.timestamp)) {
          audio.pause();
          setIsPlaying(false);
          onTimestampReached?.(nextQuestion.timestamp, nextQuestion.question);
          setNextQuestionIndex(nextQuestionIndex + 1);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      dispatch(setDurationAction(audio.duration));
    };

    const handleCanPlay = () => {
      onCanPlay?.();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', () => onEnded?.());
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', () => onEnded?.());
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [dispatch, onEnded, sortedTimedQuestions, onTimestampReached, maxWatchedTime, onCanPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = songUrl;
      audio.load();
    }
  }, [songUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const seekBack = () => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5);
  };

  const seekForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTo = seekForwardDenial ? Math.min(audio.currentTime + 5, maxWatchedTime) : audio.currentTime + 5;
    audio.currentTime = Math.min(seekTo, duration);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const timelineWidth = e.currentTarget.offsetWidth;
    const clickPosition = e.nativeEvent.offsetX;
    const seekToPercentage = clickPosition / timelineWidth;
    const seekToTime = seekToPercentage * duration;
    audio.currentTime = seekForwardDenial && seekToTime > maxWatchedTime ? maxWatchedTime : seekToTime;
  };

  return (
    <div className="music-player bg-black px-4 py-2 outline-black outline outline-4 rounded-xl">
      <div className="flex flex-col h-full">
        <audio ref={audioRef} style={{ display: 'none' }} />
        <div className="controls flex-grow flex justify-between items-center mb-2">
          <button onClick={seekBack}><FaBackward /></button>
          <button onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
          <button onClick={seekForward}><FaForward /></button>
          <div className="time-info text-white">{formatTime(currentTime)} / {formatTime(duration)}</div>
          <button onClick={toggleVolumeSlider} className="volume-btn"><FaVolumeUp /></button>
          {showVolumeSlider && (
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          )}
        </div>
        <div className="timeline" onClick={handleTimelineClick}>
          <div className="base-line">
            <div className="current-time-line" style={{ width: `${(currentTime / duration) * 100}%` }} />
            <div className="max-watched-time-line" style={{ width: `${(maxWatchedTime / duration) * 100}%` }} />
            {sortedTimedQuestions.map((question, index) => (
              <div
                key={index}
                className="question-marker"
                style={{ left: `${(Number(question.timestamp) / duration) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default FeedbackMusicPlayer;