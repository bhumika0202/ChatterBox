import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ users, selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const { onlineUsers, typingUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-80 bg-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">💬 ChatterBox</h1>
          <p className="text-gray-400 text-sm">@{user?.username}</p>
        </div>
        {/* update button */}
        <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 text-sm transition"
            >
            Logout
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-gray-500 text-xs uppercase px-2 py-2">
          All Users
        </p>
        {users.length === 0 ? (
            <div className="text-center mt-10">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-gray-500 text-sm">No other users yet</p>
            </div>
            ) : (
                users.map((u) => (
                <div
                    key={u._id}
                    onClick={() => onSelectUser(u)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition mb-1
                    ${selectedUser?._id === u._id
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-700'
                    }`}
                >
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.username[0].toUpperCase()}
                        </div>
                        {/* Only show dot if online */}
                        {onlineUsers.includes(u._id) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 bg-green-400" />
                        )}
                    </div>

                    {/* User Info */}
                    <div>
                        <p className="text-white font-medium text-sm">{u.username}</p>

                        {/* Only show typing indicator, nothing else */}
                        {typingUsers.includes(u._id) && (
                            <p className="text-green-400 text-xs animate-pulse">
                            typing...
                            </p>
                        )}
                    </div>
                </div>
                )))}
      </div>
    </div>
  );
};

export default Sidebar;