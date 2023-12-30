"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UserDetails {
  username: string;
  bio: string;
  proficiencyLevel: string;
  instruments: string;
  favoriteBands: string;
  favoriteGenres: string;
}

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);

      try {
        const token = await getToken();
        const response = await fetch('/api/getUserDetails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, getToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userDetails) {
    return <div>User details not found.</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {userDetails.username}</p>
      <p><strong>Bio:</strong> {userDetails.bio}</p>
      <p><strong>Proficiency Level:</strong> {userDetails.proficiencyLevel}</p>
      <p><strong>Instruments:</strong> {userDetails.instruments}</p>
      <p><strong>Favorite Bands:</strong> {userDetails.favoriteBands}</p>
      <p><strong>Favorite Genres:</strong> {userDetails.favoriteGenres}</p>
    </div>
  );
};

export default UserProfile;
