// FeedbackVideoPlayer.tsx
import React from 'react';

interface FeedbackVideoPlayerProps {
  src: string;
  ref: React.RefObject<HTMLVideoElement>;
}

const FeedbackVideoPlayer: React.FC<FeedbackVideoPlayerProps> = ({ src, ref }) => {
  return <video ref={ref} src={src} style={{ width: '100%', height: 'auto' }} />;
};

export default FeedbackVideoPlayer;