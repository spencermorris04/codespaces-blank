"use client";
import React, { useEffect, useState, useRef } from 'react';
import FeedbackSongCard from '../../../../components/FeedbackSongCard'; // Adjust the import path as necessary
import FeedbackActivityList from '../../../../components/FeedbackActivityList'; // Adjust the import path as necessary

// UserDetails Interface
interface UserDetails {
  id: number;
  userId: string;
  username: string;
  bio: string;
  proficiencyLevel: string;
  instruments: string;
  totalPoints: number;
  favoriteBands: string;
  favoriteGenres: string;
}

// Song Interface
interface Song {
  id: number;
  songTitle: string;
  r2Id: string;
  uploaderUserId: string;
  genre: string;
  instruments: string;
  contribution: string;
  description: string;
  lyrics: string;
  timestamp: string;
}

// SongFeedback Interface
interface SongFeedback {
  id: number;
  reviewerUserId: string;
  uploaderUserId: string;
  r2Id: string;
  productionFeedback: string;
  instrumentationFeedback: string;
  songwritingFeedback: string;
  vocalsFeedback: string;
  otherFeedback: string;
  timestamp: string;
}

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [userFeedback, setUserFeedback] = useState<SongFeedback[]>([]);
  const listRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Fetch User Details
    fetch(`/api/getUserDetails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    .then(response => response.json())
    .then(data => setUserDetails(data));

    // Fetch User Songs
    fetch(`/api/getUserSongs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    .then(response => response.json())
    .then(data => setUserSongs(data));

    // Fetch User Feedback
    fetch(`/api/getUserFeedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    .then(response => response.json())
    .then(data => setUserFeedback(data));
  }, [userId]);

  return (
    <div className="flex h-full"> {/* Changed to flex for better control */}
      {/* Left Pane - User Details */}
      <div className="flex flex-col w-1/3 items-center p-4"> {/* Adjusted for centering */}
        {/* User Profile and Username */}
        <div className="flex flex-col items-center">
          <img
            src="https://cartoonavatar.com/wp-content/uploads/2022/01/Business-Avatar-On-Circle-Background.png"
            alt="User_Error"
            className="rounded-full w-48 h-48" // Adjusted for fixed size
          />
          {userDetails && (
            <p className="text-center bg-neo-red text-white font-bold py-2 px-6 rounded-2xl mt-4 text-2xl outline outline-black outline-4">
              {userDetails.username}
            </p>
          )}
        </div>
        {/* User Details */}
        <div className="bg-neo-light-pink rounded-md my-4 outline outline-4">
                {userDetails ? (
                    <div className="flex-col">
                    <p className="bg-white mx-3 my-3 rounded-lg outline outline-3 flex p-4">Bio: {userDetails.bio}</p>
                    <p className="bg-white mx-3 my-3 rounded-lg outline outline-3 flex p-4">Skill Level: {userDetails.proficiencyLevel}</p>
                    <p className="bg-white mx-3 my-3 rounded-lg outline outline-3 flex p-4">Instruments Played: {userDetails.instruments}</p>
                    <p className="bg-white mx-3 my-3 rounded-lg outline outline-3 flex p-4">Favorite Genres: {userDetails.favoriteGenres}</p>
                    <p className="bg-white mx-3 my-3 rounded-lg outline outline-3 flex p-4">Favorite Bands: {userDetails.favoriteBands}</p>
                    </div>
                ) : (
                    <p>Loading user details...</p>
                )}
            </div>
      </div>

      {/* Right Pane - Feedback Activity and Song Cards */}
      <div className="w-2/3 flex flex-col mt-4 mr-10 ml-4 pl-10">
        {/* Feedback Activity */}
        <div className="overflow-y-scroll no-scrollbar bg-neo-light-pink h-1/2 outline outline-4 rounded-lg mb-4">
          <FeedbackActivityList userId={userId} />
        </div>

        {/* Song Cards */}
        <div className="flex-1 overflow-y-scroll no-scrollbar mb-4 bg-neo-light-pink outline outline-4 p-1 rounded-lg">
            <div ref={listRef} className="px-6 pt-2 overflow-y-auto no-scrollbar h-full">
            <div className="grid grid-cols-3 gap-y-3 gap-x-5 place-items-center">
                {userSongs.map(song => (
                <div key={song.id} className="flex flex-col outline outline-4 rounded-3xl w-fit">
                    <FeedbackSongCard song={song} />
                </div>
                ))}
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}