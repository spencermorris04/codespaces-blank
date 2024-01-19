"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { db } from '~/util/firebase';
import { Timestamp, collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import NewConversationModal from '~/components/NewConversationModal';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

interface Conversation {
  conversationId: string;
  conversationName: string;
  participants: string[];
}

interface Message {
  senderId: string;
  content: string;
  createdAt: Date;
}

const MessagingPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const { userId } = useAuth(); // Replace with your method to get the current user's ID
  const [showModal, setShowModal] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState('');
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchFirebaseToken = async () => {
      const token = await getToken();  // Get the Bearer token from Clerk
  
      const tokenResponse = await fetch('/api/createFirebaseToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Include the Bearer token in the request headers
        },
        body: JSON.stringify({ userId })
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        setFirebaseToken(tokenData.firebaseToken);
      } else {
        console.error('Failed to obtain Firebase token:', tokenResponse.statusText);
      }
    };

    fetchFirebaseToken();
  }, [userId, getToken]);


  useEffect(() => {
    // Real-time listener for conversations
    const convRef = collection(db, 'conversations');
    const convQuery = query(convRef, where('participants', 'array-contains', userId));
    const unsubscribeConv = onSnapshot(convQuery, (snapshot) => {
      const convData = snapshot.docs.map(doc => ({ ...doc.data(), conversationId: doc.id }));
      setConversations(convData as Conversation[]);
    });

    return () => unsubscribeConv(); // Cleanup subscription
  }, [userId]);

  useEffect(() => {
    if (selectedConversation) {
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(
        messagesRef,
        where('conversationId', '==', selectedConversation),
        orderBy('createdAt')
      );
      const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => {
          const data = doc.data() as Message;
          // Check and convert Firestore Timestamp to JavaScript Date
          if (data.createdAt && data.createdAt instanceof Timestamp) {
            data.createdAt = data.createdAt.toDate();
          }
          return data;
        });
        // Sort messages by 'createdAt' timestamp
        messagesData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        setMessages(messagesData);
      });
      // After the messages are set, scroll to the bottom
      scrollToBottom();

      return () => unsubscribeMessages(); // Cleanup subscription
    }
  }, [selectedConversation]);

  // Add this useEffect for auto-scrolling when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Dependency on messages array
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' && selectedConversation) {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        conversationId: selectedConversation,
        senderId: userId,
        content: newMessage,
        createdAt: new Date()
      });
      setNewMessage(''); // Clear the input after sending
      scrollToBottom();
    }
  };

  return (
    <>
      {showModal && firebaseToken && (
        <NewConversationModal
          onClose={() => setShowModal(false)}
          userId={userId}
          firebaseToken={firebaseToken}
        />
      )}
      <div className="flex h-[90vh]">
        {/* Add a button to open the modal */}
        <button 
          onClick={() => setShowModal(true)}
          className="bg-black text-white rounded px-4 py-2 m-4 h-fit w-full"
        >
          New Conversation
        </button>
      {/* Left Pane: Conversations List */}
      <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
        {conversations.map(conversation => (
          <div 
            key={conversation.conversationId}
            onClick={() => handleSelectConversation(conversation.conversationId)}
            className={`p-4 cursor-pointer ${selectedConversation === conversation.conversationId ? 'bg-gray-200' : 'bg-white'}`}
          >
            <h3 className="font-bold">{conversation.conversationName}</h3>
            <p>Participants: {conversation.participants.join(', ')}</p>
          </div>
        ))}
      </div>

      {/* Right Pane: Messages */}
      <div className="w-2/3 flex flex-col">
        <div className="overflow-y-auto flex-grow">
            {messages.map((message, index) => (
                <div key={index} className={`p-4 ${message.senderId === userId ? 'text-right' : 'text-left'}`}>
                    <div className="inline-block bg-gray-200 rounded px-4 py-2">
                        <p>{message.content}</p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-gray-300 p-4">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="border border-gray-300 rounded w-full px-2 py-1 mr-2"
          />
          <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded px-4 py-2">
            Send
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default MessagingPage;