import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure of the feedback state
interface FeedbackState {
    productionFeedback: string;
    instrumentationFeedback: string;
    songwritingFeedback: string;
    vocalsFeedback: string;
    otherFeedback: string;
  }
  
  // Define the payload type for the updateFeedback action
  interface UpdateFeedbackPayload {
    field: keyof FeedbackState;
    value: string;
  }
  
  // Set the initial state
  const initialState: FeedbackState = {
    productionFeedback: '',
    instrumentationFeedback: '',
    songwritingFeedback: '',
    vocalsFeedback: '',
    otherFeedback: '',
  };

  export const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
      updateFeedback: (state, action: PayloadAction<UpdateFeedbackPayload>) => {
        const { field, value } = action.payload;
        state[field] = value;
      },
      resetFeedback: () => initialState,
    },
  });
  
  export const { updateFeedback, resetFeedback } = feedbackSlice.actions;
  export default feedbackSlice.reducer;