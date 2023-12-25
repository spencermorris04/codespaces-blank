"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";

const SongsPage = () => {
  const [songs, setSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/getSongs', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [getToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Song IDs</h1>
      <ul>
        {songs.map((songId, index) => (
          <li key={index}>{songId}</li>
        ))}
      </ul>
    </div>
  );
};

export default SongsPage;