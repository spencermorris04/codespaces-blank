import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import { addPoints } from '../app/store/slices/pointsSlice';
import { AppDispatch } from '../app/store/store';
import classNames from 'classnames'; // A utility to conditionally join classNames

interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  presignedUrl?: string;
  uploaderUserId: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
  timestamp: string;
}

interface Feedback {
  productionFeedback: string;
  instrumentationFeedback: string;
  songwritingFeedback: string;
  vocalsFeedback: string;
  otherFeedback: string;
}

interface FeedbackFormProps {
  selectedSong: Song;
  onFeedbackSubmitted: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ selectedSong, onFeedbackSubmitted }) => {
  const [feedback, setFeedback] = useState<Feedback>({
    productionFeedback: '',
    instrumentationFeedback: '',
    songwritingFeedback: '',
    vocalsFeedback: '',
    otherFeedback: ''
  });
  const { userId, getToken } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFeedback({ ...feedback, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSong || !userId) return;
  
    const token = await getToken();
    const submissionData = {
      ...feedback,
      r2Id: selectedSong.r2Id,
      reviewerUserId: userId,
      uploaderUserId: selectedSong.uploaderUserId
    };
  
    try {
      const feedbackResponse = await fetch('/api/uploadFeedbackForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData),
      });
  
      if (feedbackResponse.ok) {
        toast.success('Feedback submitted successfully');
        setFeedback({
          productionFeedback: '',
          instrumentationFeedback: '',
          songwritingFeedback: '',
          vocalsFeedback: '',
          otherFeedback: ''
        });
        onFeedbackSubmitted();
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error(`Error submitting feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

    // Class names for input and label
    const inputClass = classNames(
        'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4'
      );
      const labelClass = 'block text-gray-700 text-sm font-bold mb-2';

  return (
    <form onSubmit={handleSubmit} className="bg-neo-light-pink shadow-md rounded-lg outline outline-4 px-8 pt-6 pb-8 mb-4">
      {/* Production Feedback */}
      <div className="mb-4">
        <label className={labelClass} htmlFor="productionFeedback">Production Feedback:</label>
        <textarea
          id="productionFeedback"
          name="productionFeedback"
          value={feedback.productionFeedback}
          onChange={handleInputChange}
          className={inputClass}
        />
      </div>

      {/* Instrumentation Feedback */}
      <div className="mb-4">
        <label className={labelClass} htmlFor="instrumentationFeedback">Instrumentation Feedback:</label>
        <textarea
          id="instrumentationFeedback"
          name="instrumentationFeedback"
          value={feedback.instrumentationFeedback}
          onChange={handleInputChange}
          className={inputClass}
        />
      </div>

      {/* Songwriting Feedback */}
      <div className="mb-4">
        <label className={labelClass} htmlFor="songwritingFeedback">Songwriting Feedback:</label>
        <textarea
          id="songwritingFeedback"
          name="songwritingFeedback"
          value={feedback.songwritingFeedback}
          onChange={handleInputChange}
          className={inputClass}
        />
      </div>

      {/* Vocals Feedback */}
      <div className="mb-4">
        <label className={labelClass} htmlFor="vocalsFeedback">Vocals Feedback:</label>
        <textarea
          id="vocalsFeedback"
          name="vocalsFeedback"
          value={feedback.vocalsFeedback}
          onChange={handleInputChange}
          className={inputClass}
        />
      </div>

      {/* Other Feedback */}
      <div className="mb-4">
        <label className={labelClass} htmlFor="otherFeedback">Other Feedback:</label>
        <textarea
          id="otherFeedback"
          name="otherFeedback"
          value={feedback.otherFeedback}
          onChange={handleInputChange}
          className={inputClass}
        />
      </div>

      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4">
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;
