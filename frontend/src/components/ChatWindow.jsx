import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from '../utils/axios';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // Fetch message history
  useEffect(() => {
    if (!selectedUser) return;
    setMessages([]);
    setLoadingMessages(true);
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/messages/${selectedUser._id}`);
        setMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      if (message.sender._id === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('messageSent', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('userTyping', ({ senderId }) => {
      if (senderId === selectedUser?._id) setIsTyping(true);
    });

    socket.on('userStoppedTyping', ({ senderId }) => {
      if (senderId === selectedUser?._id) setIsTyping(false);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageSent');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [socket, selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: input,
    });

    socket.emit('stopTyping', {
      senderId: user._id,
      receiverId: selectedUser._id,
    });

    setInput('');
  };

  // Typing indicator
  const handleTyping = (e) => {
    if (e.target.value.length > 500) return;
    setInput(e.target.value);

    socket?.emit('typing', {
      senderId: user._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('stopTyping', {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  // Send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">💬</p>
          <p className="text-white text-xl font-semibold">
            Welcome to ChatterBox
          </p>
          <p className="text-gray-400 mt-2">
            Select a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 flex flex-col h-screen">
      {/* Chat Header */}
      <div className="h-[72px] px-4 border-b border-gray-700 bg-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{selectedUser.username}</p>
          {isTyping ? (
            <p className="text-yellow-400 text-xs animate-pulse">typing...</p>
          ) : (
            <p className="text-gray-400 text-xs">Click to chat</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
            {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 animate-pulse">Loading messages...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                <p className="text-4xl mb-3">👋</p>
                <p className="text-gray-400 text-sm">
                    No messages yet. Say hello to {selectedUser.username}!
                </p>
                </div>
            ) : (
                messages.map((msg) => (
                <MessageBubble key={msg._id} message={msg} />
                ))
            )}
            <div ref={bottomRef} />
        </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedUser.username}...`}
            maxLength={500}
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Send
          </button>
        </div>
        {/* Character count */}
        {input.length > 400 && (
          <p className="text-right text-xs text-gray-500 mt-1">
            {500 - input.length} characters remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;