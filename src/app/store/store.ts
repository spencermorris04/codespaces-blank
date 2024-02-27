import { configureStore } from '@reduxjs/toolkit';
import pointsReducer from './slices/pointsSlice';
import feedbackReducer from './slices/feedbackSlice';
import musicPlayerReducer from './slices/musicPlayerSlice';

export const store = configureStore({
  reducer: {
    points: pointsReducer,
    feedback: feedbackReducer,
    musicPlayer: musicPlayerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;