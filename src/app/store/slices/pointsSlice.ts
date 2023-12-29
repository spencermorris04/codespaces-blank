import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface PointsState {
  totalPoints: number;
}

const initialState: PointsState = {
  totalPoints: 0,
};

// Async thunk for fetching user points
export const fetchUserPoints = createAsyncThunk(
  'points/fetchUserPoints',
  async (userId: string) => {
    const response = await fetch('/api/getUserPoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return data.totalPoints;
  }
);

// Async thunk for adding points
export const addPoints = createAsyncThunk(
  'points/addPoints',
  async ({ userId, points }: { userId: string; points: number }) => {
    await fetch('/api/addPoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, points, transactionType: 'AddPoints' }),
    });
    return points;
  }
);

// Async thunk for removing points
export const removePoints = createAsyncThunk(
  'points/removePoints',
  async ({ userId, points }: { userId: string; points: number }) => {
    await fetch('/api/removePoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, points, transactionType: 'RemovePoints' }),
    });
    return points;
  }
);

export const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPoints.fulfilled, (state, action: PayloadAction<number>) => {
        state.totalPoints = action.payload;
      })
      .addCase(addPoints.fulfilled, (state, action: PayloadAction<number>) => {
        state.totalPoints += action.payload;
      })
      .addCase(removePoints.fulfilled, (state, action: PayloadAction<number>) => {
        state.totalPoints -= action.payload;
      });
  },
});

export default pointsSlice.reducer;