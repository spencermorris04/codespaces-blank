import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentTime, selectDuration } from '~/app/store/selectors/musicPlayerSelectors';

const PlaybackProgressDonut = () => {
  const currentTime = useSelector(selectCurrentTime);
  const duration = useSelector(selectDuration);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
      <svg width="100" height="100" viewBox="0 0 42 42" className="donut">
        <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
        <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="3"></circle>
        <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ce4b99" strokeWidth="3" strokeDasharray={`${progress} ${100 - progress}`} strokeDashoffset="25"></circle>
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default PlaybackProgressDonut;
