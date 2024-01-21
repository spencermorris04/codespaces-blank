"use client";
import React, { useState } from 'react';
import { db, auth } from '~/util/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@clerk/nextjs';
import { ref, set } from "firebase/database";

interface NewConversationModalProps {
  onClose: () => void;
  userId: string;
  firebaseToken: string | null;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ onClose, userId, firebaseToken }) => {
    const [usernames, setUsernames] = useState<string>(''); // Add type annotation
    const [conversationName, setConversationName] = useState<string>(''); // Add type annotation
    const { getToken } = useAuth();
  
    const createConversation = async () => {
      if (!firebaseToken) {
        console.error('Firebase token not available');
        return;
      }
    
      // Sign in to Firebase with the custom token
      await signInWithCustomToken(auth, firebaseToken);
    
      // Continue with conversation creation
      const usernamesArray: string[] = usernames.split(',').map(username => username.trim()); // Add type annotation
      const participantIds: string[] = [userId]; // Include the current user
    
      for (const username of usernamesArray) {
        const token = await getToken(); // Get the Bearer token from Clerk
    
        const userDetailsResponse = await fetch('/api/getUserId', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the Bearer token in the request headers
          },
          body: JSON.stringify({ username })
        });
    
        const userDetails = await userDetailsResponse.json();
        if (userDetails.userId) {
          participantIds.push(userDetails.userId);
        }
      }
    
      // Ensure unique user IDs
      const uniqueParticipantIds: string[] = Array.from(new Set(participantIds));
    
      // Create the conversation with the correct structure
      const conversationId: string = uuidv4(); // Add type annotation
      const conversationData: { [key: string]: any } = {
        conversationName,
        participants: uniqueParticipantIds.reduce((acc: { [key: string]: boolean }, curr: string) => {
          acc[curr] = true;
          return acc;
        }, {}),
        createdAt: Date.now()
      };
    
      // Write the new conversation data
      const newConversationRef = ref(db, `conversations/${conversationId}`);
      await set(newConversationRef, conversationData);
      const token = await getToken(); // Get the Bearer token from Clerk
      // Make a POST request to update user conversations
      try {
        const response = await fetch('/api/updateUserConversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // if needed
          },
          body: JSON.stringify({
            conversationId,
            participantIds: uniqueParticipantIds
          })
        });
    
        if (!response.ok) {
          throw new Error('Failed to update user conversations');
        }
      } catch (error: any) { // Add type annotation for error
        console.error('Error updating user conversations:', error);
        if ('response' in error && error.response) {
          const errorResponse = await error.response.json();
          console.error('Error response:', errorResponse);
        }
      }
    
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
