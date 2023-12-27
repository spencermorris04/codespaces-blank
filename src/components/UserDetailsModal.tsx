"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const UserDetailsModal = () => {
  const { userId, getToken } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: '',
    bio: '',
    proficiencyLevel: '',
    instruments: '',
    favoriteBands: '',
    favoriteGenres: '',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`/api/getUserDetails?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (!data || Object.keys(data).length === 0) {
            setModalVisible(true); // Show modal if no user details are found
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId, getToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await fetch('/api/updateUserDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, ...userDetails }),
      });

      setModalVisible(false); // Close modal after updating details
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  if (!isModalVisible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>User Details</h2>
        <form onSubmit={handleSubmit}>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={userDetails.username}
            onChange={handleChange}
          />

          <label>Bio:</label>
          <textarea
            name="bio"
            value={userDetails.bio}
            onChange={handleChange}
          />

          <label>Proficiency Level:</label>
          <select
            name="proficiencyLevel"
            value={userDetails.proficiencyLevel}
            onChange={handleChange}
          >
            <option value="">Select Proficiency Level</option>
            <option value="beginner">Beginner</option>
            <option value="novice">Novice</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
            <option value="muse">Muse</option>
          </select>

          <label>Instruments:</label>
          <input
            type="text"
            name="instruments"
            value={userDetails.instruments}
            onChange={handleChange}
          />

          <label>Favorite Bands:</label>
          <input
            type="text"
            name="favoriteBands"
            value={userDetails.favoriteBands}
            onChange={handleChange}
          />

          <label>Favorite Genres:</label>
          <input
            type="text"
            name="favoriteGenres"
            value={userDetails.favoriteGenres}
            onChange={handleChange}
          />

          <button type="submit">Save Details</button>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsModal;
