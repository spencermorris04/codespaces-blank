"use client";
import React, { useState } from 'react';
import { db, auth } from '~/util/firebase';  // Import db and auth from firebase utility
import { collection, addDoc } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@clerk/nextjs';

const NewConversationModal = ({ onClose, userId, firebaseToken }) => {
  const [usernames, setUsernames] = useState('');
  const [conversationName, setConversationName] = useState('');
  const { getToken } = useAuth();

  const createConversation = async () => {
    if (!firebaseToken) {
      console.error('Firebase token not available');
      return;
    }
  
    // Sign in to Firebase with the custom token
    await signInWithCustomToken(auth, firebaseToken);
  
    // Continue with conversation creation
    const usernamesArray = usernames.split(',').map(username => username.trim());
    const participantIds = [userId]; // Include the current user
  
    for (const username of usernamesArray) {
      const token = await getToken();  // Get the Bearer token from Clerk
  
      const userDetailsResponse = await fetch('/api/getUserId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Include the Bearer token in the request headers
        },
        body: JSON.stringify({ username })
      });
  
      const userDetails = await userDetailsResponse.json();
      if (userDetails.userId) {
        participantIds.push(userDetails.userId);
      }
    }
  
    // Ensure unique user IDs
    const uniqueParticipantIds = Array.from(new Set(participantIds));
  
    // Create the conversation
    const conversationId = uuidv4();
    await addDoc(collection(db, 'conversations'), {
      conversationId,
      conversationName,
      participants: uniqueParticipantIds,
      createdAt: new Date()
    });
  
    onClose(); // Close the modal after creating the conversation
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        <h2 className="text-lg font-bold mb-4">Create New Conversation</h2>
        <input
          type="text"
          placeholder="Conversation Name"
          value={conversationName}
          onChange={(e) => setConversationName(e.target.value)}
          className="border border-gray-300 rounded w-full px-2 py-1 mb-4"
        />
        <input
          type="text"
          placeholder="Usernames (comma-separated)"
          value={usernames}
          onChange={(e) => setUsernames(e.target.value)}
          className="border border-gray-300 rounded w-full px-2 py-1 mb-4"
        />
        <div className="flex justify-end">
          <button onClick={createConversation} className="bg-blue-500 text-white rounded px-4 py-2 mr-2">
            Create
          </button>
          <button onClick={onClose} className="bg-gray-300 rounded px-4 py-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;