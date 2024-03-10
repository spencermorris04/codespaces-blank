// FeedbackVideoPlayer.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

interface FeedbackVideoPlayerProps {}

const FeedbackVideoPlayer = forwardRef<HTMLVideoElement, FeedbackVideoPlayerProps>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  return (
    <div className="video-container">
      <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
});

export default FeedbackVideoPlayer;