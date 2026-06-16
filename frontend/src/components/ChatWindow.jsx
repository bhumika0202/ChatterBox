import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../utils/theme';
import axios from '../utils/axios';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const t = themes[theme];
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!selectedUser) {
    return (
      <div className={`flex-1 ${t.bgMain} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-6xl mb-4">💬</p>
          <p className={`${t.textPrimary} text-xl font-semibold`}>
            Welcome to ChatterBox
          </p>
          <p className={`${t.textSecondary} mt-2`}>
            Select a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 ${t.bgMain} flex flex-col h-screen`}>
      {/* Header */}
      <div className={`h-[72px] px-4 ${t.bgHeader} flex items-center gap-3 shadow-sm`}>
        <div className={`w-10 h-10 rounded-full ${t.accentAvatar} flex items-center justify-center text-white font-bold`}>
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div>
          <p className={`${t.textPrimary} font-semibold`}>
            {selectedUser.username}
          </p>
          {isTyping ? (
            <p className="text-green-400 text-xs animate-pulse">typing...</p>
          ) : (
            <p className={`${t.textSecondary} text-xs`}>Click to chat</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 ${t.bgMain}`}>
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <p className={`${t.textSecondary} animate-pulse`}>
              Loading messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-4xl mb-3">👋</p>
            <p className={`${t.textSecondary} text-sm`}>
              No messages yet. Say hello to {selectedUser.username}!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} t={t} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`p-4 ${t.bgHeader} shadow-sm`}>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedUser.username}...`}
            maxLength={500}
            className={`flex-1 ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-xl outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`${t.accent} ${t.accentHover} disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition`}
          >
            Send
          </button>
        </div>
        {input.length > 400 && (
          <p className={`text-right text-xs ${t.textSecondary} mt-1`}>
            {500 - input.length} characters remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;