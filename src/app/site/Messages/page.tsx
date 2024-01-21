"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import NewConversationModal from '~/components/NewConversationModal';
import MessagesModal from '~/components/MessagesModal'
import { ref, onValue, push, set } from "firebase/database";
import { db } from '~/util/firebase'

  interface Conversation {
    id: string;
    conversationName: string;
    participants: { [key: string]: { userId: string, username: string } };
  }
  
  interface Message {
    senderId: string;
    content: string;
    createdAt: Date;
    messageId: string;
    username: string; // Added username field
  }

  const MessagingPage = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [participants, setParticipants] = useState<{ [key: string]: { userId: string, username: string } }>({});
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const { userId } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [firebaseToken, setFirebaseToken] = useState('');
    const { getToken } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false)
    const safeUserId = userId || '';
    const [hoveredUsername, setHoveredUsername] = useState<string | null>(null);

    // Inline styles for username
    const usernameStyle = {
        display: 'inline-block',
        maxWidth: '60px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    const usernameHoverStyle = {
    };

    // Detect mobile view
    useEffect(() => {
        const checkMobile = () => {
        const match = window.matchMedia("(max-width: 768px)");
        setIsMobile(match.matches);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const openMessagesModal = (conversationId: string) => {
        handleSelectConversation(conversationId);
        setIsMessagesModalOpen(true);
      };
      
    
    const closeMessagesModal = () => {
    setIsMessagesModalOpen(false);
    };

    useEffect(() => {
        const fetchFirebaseToken = async () => {
            try {
                // Assuming userId is the correct identifier for your Firebase users
                const response = await fetch('/api/createFirebaseToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: safeUserId })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch Firebase token');
                }

                const data = await response.json();
                setFirebaseToken(data.firebaseToken);
            } catch (error) {
                console.error('Error fetching Firebase token:', error);
            }
        };

        if (safeUserId) {
            fetchFirebaseToken();
        }
    }, [safeUserId]);

    // Function to open the New Conversation Modal
    const openNewConversationModal = () => {
        console.log("Opening New Conversation Modal");
        console.log("Firebase Token:", firebaseToken);
        setShowModal(true);
    };

    useEffect(() => {
        console.log("showModal changed:", showModal);
    }, [showModal]);

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Fetch messages using the API
    const fetchMessages = async (conversationId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(`/api/getMessages?conversationId=${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            console.log("API Response: ", response); // Log the response
    
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
    
            const fetchedMessages = await response.json();
            console.log("Fetched Messages: ", fetchedMessages); // Log the fetched messages
    
            const sortedMessages = fetchedMessages.sort((a: Message, b: Message) => {
                // Convert createdAt to Date object if it's not already
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA.getTime() - dateB.getTime();
              });
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Function to handle conversation selection
    const handleSelectConversation = async (conversationId: string | null) => {
        setSelectedConversation(conversationId);
        if (conversationId) {
            await fetchMessages(conversationId); // Fetch initial messages using the API
            subscribeToFirebaseUpdates(conversationId); // Then subscribe to real-time updates
        }
        if (isMobile) {
            setIsMessagesModalOpen(true);
        }
    };

    const subscribeToFirebaseUpdates = (conversationId: string) => {
        const messagesRef = ref(db, `messages/${conversationId}`);
        const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            let messagesArray = data ? Object.keys(data).map(key => ({
                messageId: key,
                ...data[key]
                // Note: Here you won't have the username, you will need to handle it
            })) : [];
            messagesArray = messagesArray.sort((a, b) => a.createdAt - b.createdAt);
            setMessages(messagesArray);
        });
    
        return () => unsubscribeMessages();
    };

    // Fetch conversations on component mount or userId change
    useEffect(() => {
        const fetchConversations = async () => {
        if (!userId) return;
    
        try {
            const token = await getToken();
            const response = await fetch('/api/getConversationIds', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-User-Id': userId,
            },
            });
    
            if (!response.ok) {
            throw new Error('Failed to fetch conversations');
            }
    
            const fetchedConversations: Conversation[] = await response.json();
    
            // Extract participants data from conversations and set it in state
            const participantsData: { [key: string]: { userId: string, username: string } } = fetchedConversations.reduce((participantsData, conversation) => {
            return {
                ...participantsData,
                [conversation.id]: conversation.participants,
            };
            }, {});
    
            setConversations(fetchedConversations);
            setParticipants(participantsData); // Set participants data in state
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
        };
    
        fetchConversations();
    }, [userId, getToken]);

    // Modified getUsernameById function for debugging
    const getUsernameById = (senderId: string) => {
        if (senderId === safeUserId) {
          return "you";
        }
        // Use username from message data for other users
        return messages.find(message => message.senderId === senderId)?.username || "Unknown";
      };

    useEffect(() => {
        if (selectedConversation) {
            const messagesRef = ref(db, `messages/${selectedConversation}`);
            const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
                const data = snapshot.val();
                let messagesArray = data ? Object.keys(data).map(key => ({
                    messageId: key,
                    ...data[key]
                })) : [];
    
                // Sort messages by createdAt timestamp
                messagesArray = messagesArray.sort((a, b) => a.createdAt - b.createdAt);
                setMessages(messagesArray);
            });
    
            return () => unsubscribeMessages(); // Unsubscribe when the component unmounts
        }
    }, [selectedConversation]);

    // Add this useEffect for auto-scrolling when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Dependency on messages array

  // Handle sending a message
  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' && selectedConversation) {
      try {
        const token = await getToken();
        const response = await fetch('/api/sendMessages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            conversationId: selectedConversation,
            senderId: userId,
            content: newMessage
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        setNewMessage('');
        fetchMessages(selectedConversation); // Refetch messages after sending
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {showModal && firebaseToken && (
        <NewConversationModal
          onClose={() => setShowModal(false)}
          userId={safeUserId}
          firebaseToken={firebaseToken}
        />
      )}
      <div className={`flex ${isMobile ? 'flex-col' : 'h-full'}`}>
        {/* Left Pane: Conversations List */}
        <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r border-gray-300'} p-4 overflow-y-auto`}>
            <button 
                onClick={openNewConversationModal} // Button to open the modal
                className="bg-black text-white rounded px-4 py-2 mb-4 w-full"
            >
                New Conversation
            </button>
            {conversations.map((conversation: Conversation) => (
                <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`bg-neo-light-pink outline outline-3 rounded-lg shadow px-2 pb-2 pt-2 cursor-pointer ${selectedConversation === conversation.id ? 'bg-gray-100' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
                >
                    <h3
                        className="font-semibold text-lg mr-2 text-center bg-white outline outline-3 px-2 rounded-lg overflow-hidden whitespace-nowrap overflow-ellipsis"
                        style={{ minWidth: '50%', maxWidth: '50%' /* Set the conversation name to take up 1/4 to 1/2 of the container */ }}
                    >
                        {conversation.conversationName}
                    </h3>
                    <div className="flex flex-nowrap gap-2 place-self-center rounded-lg px-1 py-1" style={{ overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%', textOverflow: 'ellipsis' }}>
                        {Object.entries(conversation.participants).map(([userId, userObj]) => (
                            <div key={conversation.id + "-" + userId} className="flex items-center gap-2">
                                <span className="bg-black text-white text-xs font-medium px-2.5 py-0.5 rounded" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60px' }}>
                                    {userObj.username}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

                {/* Render NewConversationModal based on showModal state */}
            {showModal && firebaseToken && (
            <NewConversationModal
                onClose={() => setShowModal(false)}
                userId={safeUserId}
                firebaseToken={firebaseToken}
            />
            )}
        </div>
  
        {/* Right Pane: Messages */}
        {!isMobile && (
            <div className="w-2/3 flex flex-col bg-black">
                <div className="overflow-y-auto flex-grow no-scrollbar">
                {messages.map((message) => (
                    <div key={message.messageId} className={`p-4 ${message.senderId === userId ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block bg-neo-purple outline outline-white outline-2 rounded-t-lg ${message.senderId === userId ? 'rounded-bl-lg' : 'rounded-br-lg'} px-4 py-2`}>
                        <p className="text-white">{message.content}</p>
                    </div>
                    <div className="mt-1">
                        <small 
                        className="text-white text-xs" 
                        style={usernameStyle} 
                        onMouseEnter={() => setHoveredUsername(typeof message.senderId === 'string' ? message.senderId : null)}
                        onMouseLeave={() => setHoveredUsername(null)}
                        >
                        {message.senderId === userId ? 'you' : message.username}
                        </small>
                    </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-gray-300 p-4 flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border border-gray-300 text-black rounded-l w-full px-2 py-1"
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage} className="bg-white text-black rounded-r px-3 py-1">
                    &#10148; {/* Right arrow symbol */}
                </button>
                </div>
            </div>
            )}
  
        {isMobile && isMessagesModalOpen && userId && (
        <MessagesModal
            onClose={() => setIsMessagesModalOpen(false)}
            messages={messages}
            sendMessage={handleSendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            userId={userId}
            participants={participants}
        />
        )}
      </div>
    </>
  );
};

export default MessagingPage;