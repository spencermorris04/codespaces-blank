import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useAuth } from '@clerk/nextjs';
import { SongFeedback, Song } from '../util/types/types'; // Adjust the path and types as per your project

interface FeedbackSongCardProps {
  song: Song; // Assuming 'Song' is a type you have defined based on your schema
}

const FeedbackSongCard: React.FC<FeedbackSongCardProps> = ({ song }) => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<SongFeedback[]>([]);
  const { getToken } = useAuth(); // Clerk hook for authentication

  const handleOpen = async () => {
    setOpen(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/getSongFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the Clerk token in the request header
        },
        body: JSON.stringify({ r2Id: song.r2Id }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else {
        // Handle error response
        console.error('Failed to fetch song feedback');
      }
    } catch (error) {
      console.error('Error fetching song feedback:', error);
    }
  };

  const handleClose = () => setOpen(false);

  // Modal style
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer bg-neo-light-pink p-4 rounded-lg">
        <h3 className="text-lg font-semibold">{song.songTitle}</h3>
        <p className="text-sm text-gray-600">Genre: {song.genre}</p>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <h2 className="text-2xl font-bold mb-4">{song.songTitle} Feedback</h2>
          {feedback.length > 0 ? (
            feedback.map((fb, index) => (
              <div key={index} className="mb-4">
                <p><strong>Production:</strong> {fb.productionFeedback}</p>
                <p><strong>Instrumentation:</strong> {fb.instrumentationFeedback}</p>
                <p><strong>Songwriting:</strong> {fb.songwritingFeedback}</p>
                <p><strong>Vocals:</strong> {fb.vocalsFeedback}</p>
                <p><strong>Other:</strong> {fb.otherFeedback}</p>
              </div>
            ))
          ) : (
            <p>No feedback available for this song.</p>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default FeedbackSongCard;
