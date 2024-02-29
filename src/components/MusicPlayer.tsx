import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTime, setDuration as setDurationAction } from '~/app/store/slices/musicPlayerSlice';
import { selectMaxWatchedTime } from '~/app/store/selectors/musicPlayerSelectors';
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeUp } from 'react-icons/fa';
import '~/app/styles/MusicPlayer.css'; // Assuming you have a CSS file for additional styles

interface MusicPlayerProps {
  songUrl: string;
  onEnded?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const maxWatchedTime = useSelector(selectMaxWatchedTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeLocal] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = songUrl;
      audio.volume = volume;

      const autoplay = async () => {
        if (!isMobileDevice() && audio) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            console.log("Autoplay was prevented.");
          }
        }
      };

      autoplay();

      const handleTimeUpdate = () => {
        setCurrentTimeLocal(audio.currentTime);
        // Update maxWatchedTime only if currentTime exceeds it
        if (audio.currentTime > maxWatchedTime) {
          dispatch(setCurrentTime(audio.currentTime));
        }
      };

      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          const { duration } = audioRef.current;
          if (duration > 0) {
            setDuration(duration); // Update local state using the local state setter function
            dispatch(setDurationAction(duration)); // Dispatch to Redux store using the renamed action creator
          }
        }
      };
      

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', () => {
        onEnded?.();
        setIsPlaying(false);
      });

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [songUrl, onEnded, dispatch, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekBack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    }
  };

  const seekForward = () => {
    const audio = audioRef.current;
    if (audio) {
      // Limit seeking forward to the maximum watched time
      const seekTo = Math.min(audio.currentTime + 5, maxWatchedTime);
      audio.currentTime = seekTo < duration ? seekTo : audio.currentTime;
    }
  };

  const toggleVolumeSlider = () => setShowVolumeSlider(!showVolumeSlider);

  const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="music-player" style={{ minWidth: '200px' }}>
      <audio ref={audioRef} />
      <div className="controls">
        <button onClick={seekBack}><FaBackward /></button>
        <button onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
        <button onClick={seekForward}><FaForward /></button>
        <div className="time-info">{formatTime(currentTime)} / {formatTime(duration)}</div>
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
      <div className="timeline">
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
