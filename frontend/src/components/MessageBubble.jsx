import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message, t }) => {
  const { user } = useAuth();
  const isOwn = message.sender._id === user._id ||
                message.sender === user._id;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
        ${isOwn
          ? `${t.accentMessage} text-white rounded-br-none`
          : `${t.bgMessageReceived} ${t.textPrimary} rounded-bl-none`
        }`}
      >
        <p>{message.message}</p>
        <p className={`text-xs mt-1 ${isOwn ? t.accentMessageText : t.textSecondary}`}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;