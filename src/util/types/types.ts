// Song type
export type Song = {
    id: number;
    songTitle: string;
    r2Id: string;
    uploaderUserId: string;
    genre: string;
    instruments: string;
    contribution: string;
    description: string;
    lyrics: string;
    // Assuming timestamp is stored as a string in JavaScript Date format
    timestamp: string;
  };
  
  // Feedback type
  export type Feedback = {
    id: number;
    reviewerUserId: string;
    uploaderUserId: string;
    r2Id: string;
    productionFeedback: string;
    instrumentationFeedback: string;
    songwritingFeedback: string;
    vocalsFeedback: string;
    otherFeedback: string;
    timestamp: string; // JavaScript Date format
  };
  
  // Props for FeedbackSongCard
  export interface FeedbackSongCardProps {
    song: Song;
    feedback: Feedback[];
    // Any other props needed for the component
  }
  
  export type SongFeedback = {
    id: number;
    reviewerUserId: string;
    uploaderUserId: string;
    r2Id: string;
    productionFeedback: string;
    instrumentationFeedback: string;
    songwritingFeedback: string;
    vocalsFeedback: string;
    otherFeedback: string;
    timestamp: string; // ISO string format of Date
  };
  
  export type FeedbackActivity = {
    id: number;
    songTitle: string;
    reviewerUserId: string;
    uploaderUserId: string;
    r2Id: string;
    productionFeedback: string;
    instrumentationFeedback: string;
    songwritingFeedback: string;
    vocalsFeedback: string;
    otherFeedback: string;
    timestamp: string;
    reviewerUsername?: string; // Optional if this data might not always be present
    uploaderUsername?: string; // Optional if this data might not always be present
  };