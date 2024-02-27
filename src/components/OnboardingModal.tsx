"use client";
import React, { useState } from 'react';

interface FormValues {
  username: string;
  bio: string;
  proficiencyLevel: string;
  instruments: string;
  favoriteBands: string;
  favoriteGenres: string;
}

interface OnboardingModalProps {
  userId: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId }) => {
  const [formData, setFormData] = useState<FormValues>({
    username: '',
    bio: '',
    proficiencyLevel: '',
    instruments: '',
    favoriteBands: '',
    favoriteGenres: '',
  });

  const [error, setError] = useState<string>(''); // Specify the type as string explicitly

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/updateUserDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user details');
      }
      router.reload(); // Refresh the page to reflect the updated details
    } catch (error: any) { // Specify the type of error explicitly as 'any'
      setError(error.message);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close">&times;</span>
        <h2>Welcome to Musephoria!</h2>
        <p>Please fill out your profile details to get started.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          {/* Add more form fields for other user details */}
          {error && <p className="error">{error}</p>}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
