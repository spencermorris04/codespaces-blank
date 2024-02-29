import { RootState } from '../store';

export const selectMaxWatchedTime = (state: RootState) => state.musicPlayer.maxWatchedTime;
export const selectDuration = (state: RootState) => state.musicPlayer.duration;
export const selectCurrentTime = (state: RootState) => state.musicPlayer.currentTime;
