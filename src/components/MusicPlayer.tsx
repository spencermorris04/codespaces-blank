import React, { useEffect, useState } from 'react';

interface MusicPlayerProps {
  songUrl: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl }) => {
  const [currentUrl, setCurrentUrl] = useState(songUrl);

  useEffect(() => {
    // Update the current URL when the songUrl prop changes
    setCurrentUrl(songUrl);
  }, [songUrl]);

  if (!currentUrl) {
    return <div>Unable to load song.</div>;
  }

  return (
    <audio controls src={currentUrl} className="">
      <source src={currentUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
};

export default MusicPlayer;
