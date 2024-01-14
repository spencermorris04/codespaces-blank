"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/nextjs';
import { addPoints } from '~/app/store/slices/pointsSlice';
import { AppDispatch } from '~/app/store/store';
import classNames from 'classnames'; // A utility to conditionally join classNames
import Modal from '@mui/material/Modal'; // Importing Modal from Material-UI
import Box from '@mui/material/Box'; // Importing Box for modal styling
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { updateFeedback, resetFeedback } from '~/app/store/slices/feedbackSlice';
import { RootState } from '~/app/store/store';



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
    submitFeedback?: () => Promise<void>; // Add this line if needed
}

let currentFeedback = {
    productionFeedback: '',
    instrumentationFeedback: '',
    songwritingFeedback: '',
    vocalsFeedback: '',
    otherFeedback: ''
  };

  const MobileFeedbackForm: React.FC<FeedbackFormProps> = ({ selectedSong, onFeedbackSubmitted }) => {
    const feedback = useSelector((state: RootState) => state.feedback);
    const dispatch = useDispatch<AppDispatch>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        dispatch(updateFeedback({ field: name as keyof Feedback, value }));
    };

    const isFeedbackFilled = useCallback((feedbackKey: keyof Feedback) => {
        return feedback[feedbackKey].trim() !== '';
    }, [feedback]);
    
        // Class names for input and label
        const inputClass = classNames(
            'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4'
          );
          const labelClass = 'block text-gray-700 text-sm font-bold mb-2';
    
          return (
            <div>
                <div onClick={toggleModal} className="bg-neo-light-pink rounded-lg outline outline-4 p-2">
                    {/* Title above Checkboxes */}
                    <div className="text-center font-bold mb-2">Feedback Completion</div>
                    <div className="flex justify-around items-center bg-white outline outline-2 rounded-xl">
                    {/* Compact View with Checkboxes */}
                    <Checkbox checked={isFeedbackFilled('productionFeedback')} readOnly />
                    <Checkbox checked={isFeedbackFilled('instrumentationFeedback')} readOnly />
                    <Checkbox checked={isFeedbackFilled('songwritingFeedback')} readOnly />
                    <Checkbox checked={isFeedbackFilled('vocalsFeedback')} readOnly />
                    <Checkbox checked={isFeedbackFilled('otherFeedback')} readOnly />
                    </div>
                </div>
          
              <Modal open={isModalOpen} onClose={toggleModal} aria-labelledby="feedback-form-modal" className="feedback-modal m-8 h-1/2">
                <Box className="modal-box" style={{ maxHeight: '85vh', overflow: 'auto' }}>
                {/* Close Button */}
                <button onClick={toggleModal} className="close-button" style={{ float: 'right' }}>
                    X
                </button>

                <form className="bg-neo-light-pink shadow-md rounded-lg outline outline-4 px-8 pt-6">
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
                    </form>
                </Box>
              </Modal>
            </div>
          );
        };

const getCurrentFeedback = () => currentFeedback; // This function now returns the updated feedback

const resetCurrentFeedback = () => {
    currentFeedback = {
      productionFeedback: '',
      instrumentationFeedback: '',
      songwritingFeedback: '',
      vocalsFeedback: '',
      otherFeedback: ''
    };
  };

export { MobileFeedbackForm, getCurrentFeedback, resetCurrentFeedback };