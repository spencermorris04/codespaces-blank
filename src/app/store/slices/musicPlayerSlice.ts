import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MusicPlayerState {
  currentTime: number;
  maxWatchedTime: number;
}

const initialState: MusicPlayerState = {
  currentTime: 0,
  maxWatchedTime: 0,
};

export const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
      if (action.payload > state.maxWatchedTime) {
        state.maxWatchedTime = action.payload;
      }
    },
    resetPlayer: (state) => {
      state.currentTime = 0;
      state.maxWatchedTime = 0;
    },
  },
});

export const { setCurrentTime, resetPlayer } = musicPlayerSlice.actions;

export default musicPlayerSlice.reducer;
