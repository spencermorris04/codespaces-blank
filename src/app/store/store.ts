import { configureStore } from '@reduxjs/toolkit';
import pointsReducer from './slices/pointsSlice';
import feedbackReducer from './slices/feedbackSlice';


export const store = configureStore({
  reducer: {
    points: pointsReducer,
    feedback: feedbackReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;