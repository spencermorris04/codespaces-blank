"use client";
import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import FeedbackActivityList from '../../../components/FeedbackActivityList';
import FeedbackSongCard from '../../../components/FeedbackSongCard';

interface SongFeedback {
    id: number;
    songTitle: string;
    r2Id: string;
    uploaderUserId: string;
    genre: string;
    instruments: string;
    contribution: string;
    description: string;
    lyrics: string;
    timestamp: string; // Assuming the timestamp is included in the feedback
    productionFeedback: string;
    instrumentationFeedback: string;
    songwritingFeedback: string;
    vocalsFeedback: string;
    otherFeedback: string;
  }

  interface FeedbackActivity {
    id: number;
    songTitle: string; // Title of the song for which feedback is given/received
    reviewerUserId: string; // ID of the user who reviewed
    uploaderUserId: string; // ID of the user who uploaded the song
    r2Id: string; // Reference to the song's storage ID
    productionFeedback: string;
    instrumentationFeedback: string;
    songwritingFeedback: string;
    vocalsFeedback: string;
    otherFeedback: string;
    timestamp: string; // Timestamp when the feedback was given/received
  }
  

  const FeedbackPage: React.FC = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [songFeedbacks, setSongFeedbacks] = useState<SongFeedback[]>([]);
    const [activities, setActivities] = useState<FeedbackActivity[]>([]);
  
    useEffect(() => {
      const fetchFeedbackData = async () => {
        if (user) {
          const token = await getToken();
          if (token) {
            await fetchFeedbackActivities(token);
            await fetchSongFeedbacks(token);
          }
        }
      };
  
      fetchFeedbackData();
    }, [user, getToken]);
  
    const fetchFeedbackActivities = async (token: string) => {
      const response = await fetch('/api/getFeedbackActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    };
  
    const fetchSongFeedbacks = async (token: string) => {
      const response = await fetch('/api/getFeedbackSongs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setSongFeedbacks(data);
      }
    };
  
    return (
      <div className="flex flex-row mx-4 mt-3 h-[90vh]">
        <div className="flex-1 w-1/2 px-4 py-4 overflow-y-auto">
          <FeedbackActivityList userId={user?.id || ''} />
        </div>
        <div className="flex-1 w-1/2 px-4 py-4 overflow-y-auto">
          {songFeedbacks.map((feedback) => (
            <FeedbackSongCard key={feedback.id} song={feedback} />
          ))}
        </div>
      </div>
    );
  };
  
  export default FeedbackPage;