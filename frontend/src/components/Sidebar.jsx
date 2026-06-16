import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../utils/theme';

const Sidebar = ({ users, selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const { onlineUsers, typingUsers } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const t = themes[theme];
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`w-80 ${t.bgSidebar} h-screen flex flex-col shadow-lg`}>
      {/* Header */}
      <div className={`h-[72px] px-4 ${t.bgHeader} flex items-center justify-between`}>
        <div>
          <h1 className={`${t.textPrimary} font-bold text-xl`}>
            💬 ChatterBox
          </h1>
          <p className={`${t.textSecondary} text-sm`}>@{user?.username}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`${t.textSecondary} hover:${t.textPrimary} text-xl transition`}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`${t.textSecondary} hover:text-red-400 text-sm transition`}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className={`${t.textLabel} text-xs uppercase px-2 py-2 font-semibold`}>
          All Users
        </p>
        {users.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-3xl mb-2">👥</p>
            <p className={`${t.textSecondary} text-sm`}>No other users yet</p>
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => onSelectUser(u)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition mb-1
                ${selectedUser?._id === u._id
                  ? t.bgSelected
                  : t.bgHover
                }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${t.accentAvatar} flex items-center justify-center text-white font-bold text-sm`}>
                  {u.username[0].toUpperCase()}
                </div>
                {onlineUsers.includes(u._id) && (
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${theme === 'dark' ? 'border-[#2b2d31]' : 'border-white'} bg-green-400`} />
                )}
              </div>

              {/* User Info */}
              <div>
                <p className={`${t.textPrimary} font-medium text-sm`}>
                  {u.username}
                </p>
                {typingUsers.includes(u._id) && (
                  <p className="text-green-400 text-xs animate-pulse">
                    typing...
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;