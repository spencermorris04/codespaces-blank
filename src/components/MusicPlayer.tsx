import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTime, setMaxWatchedTime, setDuration as setDurationAction } from '~/app/store/slices/musicPlayerSlice';
import { selectMaxWatchedTime } from '~/app/store/selectors/musicPlayerSelectors';
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeUp } from 'react-icons/fa';
import '~/app/styles/MusicPlayer.css'; // Assuming you have a CSS file for additional styles

interface TimedQuestion {
  timestamp: string;
  question: string;
}

interface MusicPlayerProps {
  songUrl: string;
  onEnded?: () => void;
  seekForwardDenial?: boolean; // New prop to control seek forward behavior
  onTimestampReached?: (timestamp: string, question: string) => void;
  timedQuestions: TimedQuestion[]; // Add this prop to pass the timed questions
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  songUrl,
  onEnded,
  seekForwardDenial = true,
  onTimestampReached,
  timedQuestions,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const maxWatchedTime = useSelector(selectMaxWatchedTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeLocal] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const toggleVolumeSlider = () => setShowVolumeSlider(!showVolumeSlider);

  // stop music player interaction from messing with modal states
  const handleMusicPlayerClick = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Effect for handling audio play, pause, and metadata loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);

    const handlePause = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      setCurrentTimeLocal(audio.currentTime);
      dispatch(setCurrentTime(audio.currentTime));
    
      // Check if the current time matches any of the specified timestamps
      const timestamp = audio.currentTime.toFixed(6);
      const matchingQuestion = timedQuestions?.find((q) => q.timestamp === timestamp); // Use optional chaining
      if (matchingQuestion) {
        audio.pause();
        setIsPlaying(false);
        onTimestampReached?.(timestamp, matchingQuestion.question);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      dispatch(setDurationAction(audio.duration));
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', () => onEnded?.());

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', () => onEnded?.());
    };
  }, [dispatch, onEnded, timedQuestions, onTimestampReached]);

  // Effect for songUrl change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTimeLocal(0);
    setDuration(0);
    dispatch(setCurrentTime(0));
    dispatch(setMaxWatchedTime(0));
    audio.src = songUrl; // Load new song

    // Attempt autoplay for the new song
    const autoplay = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log("Autoplay was prevented.");
      }
    };
    autoplay();
  }, [songUrl, dispatch]);

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

  const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="music-player bg-black px-4 py-2 outline-white outline outline-3 rounded-xl" style={{ minWidth: '200px' }}>
      <audio ref={audioRef} />
      <div className="controls">
        <button onClick={(e) => { seekBack(); handleMusicPlayerClick(e); }}><FaBackward /></button>
        <button onClick={(e) => { togglePlay(); handleMusicPlayerClick(e); }}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
        <button onClick={(e) => { seekForward(); handleMusicPlayerClick(e); }}><FaForward /></button>
        <div className="time-info text-white">{formatTime(currentTime)} / {formatTime(duration)}</div>
        <button onClick={(e) => { toggleVolumeSlider(); handleMusicPlayerClick(e); }} className="volume-btn"><FaVolumeUp /></button>
        {showVolumeSlider && (
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); handleMusicPlayerClick(e); }}
          />
        )}
      </div>
      <div className="timeline" onClick={(e) => { handleTimelineClick(e); handleMusicPlayerClick(e); }}>
        <div className="base-line">
          <div className="current-time-line" style={{ width: `${(currentTime / duration) * 100}%` }} />
          <div className="max-watched-time-line" style={{ width: `${(maxWatchedTime / duration) * 100}%` }} />
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

export default MusicPlayer;