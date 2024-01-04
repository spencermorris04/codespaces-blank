"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useAuth } from '@clerk/nextjs';
import { SongFeedback, Song } from '../util/types/types'; // Adjust the path and types as per your project
import Link from 'next/link';

interface FeedbackSongCardProps {
  song: Song;
}

interface UserDetails {
  username: string;
  // other user details fields
}

const FeedbackSongCard: React.FC<FeedbackSongCardProps> = ({ song }) => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<SongFeedback[]>([]);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const { getToken } = useAuth();

  const fetchUserDetails = async (userId: string, token: string): Promise<string> => {
    const response = await fetch('/api/getUserDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId }),
    });
    if (response.ok) {
      const userDetails: UserDetails = await response.json();
      return userDetails.username;
    } else {
      console.error('Failed to fetch user details');
      return '';
    }
  };

  const handleOpen = async () => {
    setOpen(true);
  
    try {
      const token = await getToken();
      if (token === null) {
        console.error('No token available');
        return; // Exit the function if there's no token
      }
  
      const response = await fetch('/api/getSongFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ r2Id: song.r2Id }),
      });
  
      if (response.ok) {
        const feedbackData: SongFeedback[] = await response.json();
        setFeedback(feedbackData);
  
        const userIds = [...new Set(feedbackData.map(fb => fb.reviewerUserId))].filter(id => id !== null);
  
        // Use Promise.all to wait for all user details to be fetched
        const userDetailsPromises = userIds.map(userId => fetchUserDetails(userId, token));
        const userDetails = await Promise.all(userDetailsPromises);
  
        const userNamesMap: { [key: string]: string } = {};
        userIds.forEach((userId, index) => {
          userNamesMap[userId] = userDetails[index] || 'Unknown User';
        });
  
        setUsernames(userNamesMap);
      } else {
        console.error('Failed to fetch song feedback');
      }
    } catch (error) {
      console.error('Error fetching song feedback:', error);
    }
  };
  
  
  

  const handleClose = () => setOpen(false);

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
      <div onClick={handleOpen} className="cursor-pointer bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold">{song.songTitle}</h3>
        <p className="text-sm text-gray-600">Genre: {song.genre}</p>
        <p className="text-sm text-gray-600">Contribution: {song.instruments}</p>
        <p className="text-sm text-gray-600">Genre: {song.timestamp}</p>

      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <h2 className="text-2xl font-bold mb-4">{song.songTitle} Feedback</h2>
          {feedback.length > 0 ? (
            feedback.map((fb, index) => (
              <div key={index} className="mb-4">
                <p>
                  <strong>User:</strong> 
                  <Link href={`/site/user/${fb.reviewerUserId}`}>
                    <div className="text-blue-600 hover:text-blue-800">{usernames[fb.reviewerUserId] || fb.reviewerUserId}</div>
                  </Link>
                </p>                
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