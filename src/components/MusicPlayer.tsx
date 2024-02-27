import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTime } from '~/app/store/slices/musicPlayerSlice';
import { selectMaxWatchedTime } from '~/app/store/selectors/musicPlayerSelectors';

interface MusicPlayerProps {
  songUrl: string;
  onEnded?: () => void; // Optional callback when the song ends
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useDispatch();
  // Use useSelector to get the maxWatchedTime from the Redux store
  const maxWatchedTime = useSelector(selectMaxWatchedTime);
  // Local state to control the display of custom controls
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = songUrl;

      // Event listener for time updates to dispatch the current time to Redux
      const handleTimeUpdate = () => {
        dispatch(setCurrentTime(audio.currentTime));
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', () => {
        onEnded?.();
        setIsPlaying(false); // Reset play state when the song ends
      });

      // Cleanup event listeners on component unmount
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', () => {
          onEnded?.();
        });
      };
    }
  }, [songUrl, onEnded, dispatch]);

  // Function to handle play/pause toggle
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

  // Function to seek 5 seconds back
  const seekBack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    }
  };

  // Function to seek forward, respecting the maxWatchedTime
  const seekForward = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime < maxWatchedTime) {
      // Seek forward only up to the maxWatchedTime
      audio.currentTime = Math.min(audio.currentTime + 5, maxWatchedTime);
    }
  };

  // Conditionally render the seek forward button
  const showSeekForward = audioRef.current?.currentTime < maxWatchedTime;

  return (
    <div>
      <audio ref={audioRef} style={{ display: 'none' }} /> {/* Hide the default controls */}
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={seekBack}>Seek Back 5s</button>
      {showSeekForward && <button onClick={seekForward}>Seek Forward 5s</button>}
    </div>
  );
};

export default MusicPlayer;
