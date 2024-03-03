"use client";
import React, { useEffect, useState } from 'react';
import FeedbackActivityList from '../../../components/FeedbackActivityList';
import FeedbackSongCard from '../../../components/FeedbackSongCard';
import { createClient } from '~/util/supabase/client'

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
    const [songFeedbacks, setSongFeedbacks] = useState<SongFeedback[]>([]);
    const [activities, setActivities] = useState<FeedbackActivity[]>([]);
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null); // Initialize userId state

    useEffect(() => {
      // Define the async function inside the useEffect
      async function fetchUserId() {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
        } else {
          setUserId(data.user.id); // Set userId state
        }
      }
  
      fetchUserId(); // Call the function
    }, []); // Empty dependency array to run once on mount

    useEffect(() => {
      const fetchFeedbackData = async () => {
        if (userId) {
          await fetchFeedbackActivities();
          await fetchSongFeedbacks();
        }
      };
  
      fetchFeedbackData();
    }, [userId]);
  
    const fetchFeedbackActivities = async () => {
      const response = await fetch('/api/getFeedbackActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId}),
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    };
  
    const fetchSongFeedbacks = async () => {
      const response = await fetch('/api/getFeedbackSongs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), // Send userId in the request body
      });
      if (response.ok) {
        const data = await response.json();
        setSongFeedbacks(data);
      } else {
        // Handle errors, maybe set an error state, and display a message to the user
        console.error("Failed to fetch song feedbacks");
      }
    };   
  
    return (
      <div className="flex flex-row mx-8 mt-8 h-[85vh]">
        <div className="flex-1 w-1/2 px-4 py-4 overflow-y-scroll no-scrollbar outline outline-4 bg-neo-light-pink rounded-lg mr-6">
          <FeedbackActivityList userId={userId || ''} />
        </div>
        <div className="bg-neo-light-pink outline outline-4 py-4 px-4 rounded-lg overflow-y-scroll no-scrollbar">
          <div className="grid h-fit grid-cols-3 gap-x-4 gap-y-4 place-items-center">
            {songFeedbacks.map((feedback) => (
                <div key={feedback.id} className="flex flex-col outline outline-4 rounded-3xl w-fit">
              <FeedbackSongCard key={feedback.id} song={feedback} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default FeedbackPage;