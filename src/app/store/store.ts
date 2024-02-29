// store.ts
import { configureStore } from '@reduxjs/toolkit';
import pointsReducer from './slices/pointsSlice';
import feedbackReducer from './slices/feedbackSlice';
import { musicPlayerSlice } from './slices/musicPlayerSlice'; // Update import statement
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    points: pointsReducer,
    feedback: feedbackReducer,
    musicPlayer: musicPlayerSlice.reducer, // Access reducer property of musicPlayerSlice
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;