import { configureStore } from '@reduxjs/toolkit';
import pointsReducer from './slices/pointsSlice';

export const store = configureStore({
  reducer: {
    points: pointsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;