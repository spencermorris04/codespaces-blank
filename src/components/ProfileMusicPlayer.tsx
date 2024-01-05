import React, { useRef, useEffect } from 'react';

interface MusicPlayerProps {
  songUrl: string;
  onEnded?: () => void; // Optional callback when the song ends
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      // Set the song source
      audioRef.current.src = songUrl;

      // Set the volume to 50%
      audioRef.current.volume = 0.5;

      // Add an event listener for when the song ends
      audioRef.current.addEventListener('ended', () => {
        if (onEnded) {
          onEnded();
        }
      });
    }
  }, [songUrl, onEnded]);

  return (
    <audio ref={audioRef} controls />
  );
};

export default MusicPlayer;
