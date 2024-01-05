"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useAuth } from '@clerk/nextjs';
import { SongFeedback, Song } from '../util/types/types'; // Adjust the path and types as per your project
import Link from 'next/link';
import ProfileMusicPlayer from './MusicPlayer'; // Adjust the import path as necessary

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
  const [songUrl, setSongUrl] = useState<string>('');
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

  const fetchSongUrl = async (objectKey: string) => {
    try {
      const token = await getToken();
      if (token === null) {
        console.error('No token available');
        return;
      }
  
      const response = await fetch('/api/getR2SongUrls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ objectKeys: [objectKey] }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0 && data[0].url) {
          setSongUrl(data[0].url);
        }
      } else {
        console.error('Failed to fetch song URL');
      }
    } catch (error) {
      console.error('Error fetching song URL:', error);
    }
  };

  useEffect(() => {
    if (song.r2Id) {
      fetchSongUrl(song.r2Id);
    }
  }, [song.r2Id]);

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
    <div className="w-fit bg-white rounded-3xl">
      <div onClick={handleOpen} className="cursor-pointer pl-8 py-4 place-self-center self-center">
        <h3 className="text-lg font-semibold">{song.songTitle}</h3>
        <p className="text-sm text-gray-600">Genre: {song.genre}</p>
        <p className="text-sm text-gray-600">Contribution: {song.instruments}</p>
        <p className="text-sm text-gray-600">Timestamp: {song.timestamp}</p>
      </div>
      <div>
          {songUrl && <ProfileMusicPlayer songUrl={songUrl} />}
      </div>
    </div>

      <Modal open={open} onClose={handleClose} className="flex">
        <Box sx={style} className="h-2/3 w-1/3 overflow-y-scroll no-scrollbar p-4 bg-neo-light-pink">
          <h2 className="text-2xl font-bold mb-4 text-center">{song.songTitle} Feedback</h2>
          {feedback.length > 0 ? (
            feedback.map((fb, index) => (
              <div key={index} className="mb-4 outline outline-4 p-2 rounded-lg bg-white">
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