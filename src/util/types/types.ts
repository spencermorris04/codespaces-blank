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
  
  export type SongFeedback {
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
  }
  
  export interface FeedbackActivity {
    id: number;
    songTitle: string;        // Title of the song
    reviewerUserId: string;   // ID of the user who reviewed the song
    uploaderUserId: string;   // ID of the user who uploaded the song
    r2Id: string;             // Reference ID for the song (if applicable)
    productionFeedback: string;   // Feedback on production
    instrumentationFeedback: string; // Feedback on instrumentation
    songwritingFeedback: string;  // Feedback on songwriting
    vocalsFeedback: string;       // Feedback on vocals
    otherFeedback: string;        // Any other feedback
    timestamp: string;            // Timestamp of when the feedback was given
  }