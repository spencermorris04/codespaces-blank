import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentTime, selectDuration } from '~/app/store/selectors/musicPlayerSelectors';

const PlaybackProgressDonut = () => {
  const currentTime = useSelector(selectCurrentTime);
  const duration = useSelector(selectDuration);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ position: 'relative', width: '55px', height: '55px' }}>
      <svg width="55" height="55" viewBox="0 0 42 42" className="donut">
        <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="black"></circle>
        <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="black" strokeWidth="3"></circle>
        <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="white" strokeWidth="3" strokeDasharray={`${progress} ${100 - progress}`} strokeDashoffset="25"></circle>
      </svg>
      <div className="text-white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default PlaybackProgressDonut;
