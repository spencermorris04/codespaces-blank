import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setDuration, setCurrentTime } from '~/app/store/slices/musicPlayerSlice';

// Define the types for audioRef and songUrl
type AudioRefType = React.MutableRefObject<HTMLAudioElement | null>;
type SongUrlType = string;

const useAudioMetadata = (audioRef: AudioRefType, songUrl: SongUrlType) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      dispatch(setDuration(audio.duration));
    };

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));
    };

    audio.src = songUrl;
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef, songUrl, dispatch]);
};

export default useAudioMetadata;
