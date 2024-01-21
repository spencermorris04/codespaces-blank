"use client";
import React, { useRef, useEffect, useState, Dispatch, SetStateAction } from 'react';

interface Message {
  messageId: string;
  senderId: string;
  content: string;
  username: string; // Added username field
}

interface MessagesModalProps {
    onClose: () => void;
    messages: Message[];
    sendMessage: () => Promise<void>;
    newMessage: string;
    setNewMessage: Dispatch<SetStateAction<string>>;
    userId: string;
    participants: { [key: string]: { userId: string, username: string } }; // Add this line
  }

const MessagesModal: React.FC<MessagesModalProps> = ({
  onClose,
  messages,
  sendMessage,
  newMessage,
  setNewMessage,
  userId
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the messages list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    sendMessage();
    setNewMessage(''); // Clear input after sending
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Inline styles for username
  const usernameStyle = {
    display: 'inline-block',
    maxWidth: '65px', // Adjusted width for better truncation
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="modal-container bg-black mx-1 rounded-lg shadow-lg p-4 max-w-md w-full text-white">
        <div className="modal-header flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Messages</h3>
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-gray-800">
            X
          </button>
        </div>
        <div className="modal-body h-[75vh] overflow-y-auto no-scrollbar">
          {messages.map((message) => (
            <div key={message.messageId} className={`p-2 ${message.senderId === userId ? 'text-right' : 'text-left'}`}>
              <div 
                className={`inline-block bg-neo-purple outline outline-white outline-2 rounded-t-lg ${message.senderId === userId ? 'rounded-bl-lg' : 'rounded-br-lg'} px-4 py-2`}
              >
                <p>{message.content}</p>
              </div>
              <div className="mt-1">
                <small className="text-white" style={usernameStyle}>
                  {message.senderId === userId ? 'you' : message.username}
                </small>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="modal-footer mt-4 flex items-center">
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
    </div>
  );
};

export default MessagesModal;
