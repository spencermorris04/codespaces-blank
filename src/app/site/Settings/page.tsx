"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import classNames from 'classnames'; // A utility to conditionally join classNames
import { createClient } from '~/util/supabase/client'


const SettingsPage = () => {
  const [userDetails, setUserDetails] = useState({
    username: '',
    bio: '',
    proficiencyLevel: '',
    instruments: '',
    favoriteBands: '',
    favoriteGenres: '',
  });
  const [loading, setLoading] = useState(true);
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
    const fetchUserDetails = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const response = await fetch(`/api/getUserDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: userId })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setUserDetails(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return; // Guard clause to check for user existence
    setLoading(true);

    try {
      await fetch('/api/updateUserDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...userDetails, userId: userId })
      });

      alert('Details updated successfully!');
    } catch (error) {
      console.error('Error updating details:', error);
      alert('Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = classNames(
    'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4',
    { 'animate-flash': loading }
  );

  const labelClass = 'block text-gray-700 text-sm font-bold mb-2';

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">User Settings</h1>
        <div className="bg-neo-light-pink shadow-md rounded-lg outline outline-4 px-8 pt-6 pb-8 mb-4">
          {/* Mock Fields for Loading */}
          <div className={labelClass}>Username:</div>
          <div className={inputClass}></div>
          <div className={labelClass}>Bio:</div>
          <div className={inputClass} style={{ height: '80px' }}></div>
          <div className={labelClass}>Proficiency Level:</div>
          <div className={inputClass} style={{ height: '80px' }}></div>
          <div className={labelClass}>Instruments played:</div>
          <div className={inputClass} style={{ height: '80px' }}></div>
          <div className={labelClass}>Favorite Bands:</div>
          <div className={inputClass} style={{ height: '80px' }}></div>
          <div className={labelClass}>Favorite Genres:</div>
          <div className={inputClass} style={{ height: '80px' }}></div>
          {/* Repeat for other fields */}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">User Settings</h1>
      <form onSubmit={handleSubmit} className="bg-neo-light-pink shadow-md rounded-lg outline outline-4 px-8 pt-6 pb-8 mb-4">
        {/* Username */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={userDetails.username}
            onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={userDetails.bio}
            onChange={(e) => setUserDetails({ ...userDetails, bio: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Proficiency Level */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proficiencyLevel">Proficiency Level:</label>
          <select
            id="proficiencyLevel"
            value={userDetails.proficiencyLevel}
            onChange={(e) => setUserDetails({ ...userDetails, proficiencyLevel: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="beginner">Beginner</option>
            <option value="amateur">Amateur</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
            <option value="muse">Muse</option>
          </select>
        </div>

        {/* Instruments */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instruments">Instruments Played:</label>
          <select
            id="instruments"
            multiple
            value={userDetails.instruments.split(',')}
            onChange={(e) => setUserDetails({ ...userDetails, instruments: Array.from(e.target.selectedOptions, option => option.value).join(',') })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-2 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="guitar">Guitar</option>
            <option value="piano">Piano</option>
            <option value="drums">Drums</option>
            <option value="violin">Violin</option>
            <option value="bass">Bass</option>
            <option value="saxophone">Saxophone</option>
            <option value="vocals">Vocals</option>
          </select>
        </div>

        {/* Favorite Bands */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="favoriteBands">Favorite Bands:</label>
          <input
            id="favoriteBands"
            type="text"
            value={userDetails.favoriteBands}
            onChange={(e) => setUserDetails({ ...userDetails, favoriteBands: e.target.value })}
            placeholder="Comma-separated list"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Favorite Genres */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="favoriteGenres">Favorite Genres:</label>
          <select
            id="favoriteGenres"
            multiple
            value={userDetails.favoriteGenres.split(',')}
            onChange={(e) => setUserDetails({ ...userDetails, favoriteGenres: Array.from(e.target.selectedOptions, option => option.value).join(',') })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="rock">Rock</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="hip_hop">Hip Hop</option>
            <option value="blues">Blues</option>
            <option value="country">Country</option>
            <option value="metal">Metal</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4">
          Update Details
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
