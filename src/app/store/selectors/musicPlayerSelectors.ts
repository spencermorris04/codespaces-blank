import { RootState } from '../store';

export const selectMaxWatchedTime = (state: RootState) => state.musicPlayer.maxWatchedTime;
