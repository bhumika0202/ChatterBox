import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../utils/theme';
import axios from '../utils/axios';

const ProfileModal = ({ onClose }) => {
  const { user, login } = useAuth();
  const { theme } = useTheme();
  const t = themes[theme];
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Handle avatar file select
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return setError('Image must be less than 5MB');
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Upload avatar
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const { data } = await axios.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login({ ...user, avatar: data.avatar });
      setSuccess('Profile picture updated!');
      setAvatarFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.put('/users/update', {
        username: form.username,
        email: form.email,
      });
      login({ ...user, ...data });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return setError('New passwords do not match');
    if (passwordForm.newPassword.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await axios.put('/users/update', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`${t.bgSidebar} rounded-2xl shadow-2xl w-full max-w-md mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
          <h2 className={`${t.textPrimary} font-bold text-lg`}>
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className={`${t.textSecondary} hover:text-red-400 text-xl transition`}
          >
            ✕
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          {/* Avatar with click to change */}
          <div className="relative group cursor-pointer mb-3"
            onClick={() => fileInputRef.current.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className={`w-20 h-20 rounded-full ${t.accentAvatar} flex items-center justify-center text-white font-bold text-3xl`}>
                {user?.username[0].toUpperCase()}
              </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-white text-xs font-semibold">Change</span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />

          {/* Upload button — only shows when new image selected */}
          {avatarFile && (
            <button
              onClick={handleAvatarUpload}
              disabled={avatarLoading}
              className={`mt-2 px-4 py-1.5 ${t.accent} ${t.accentHover} text-white text-xs rounded-lg font-semibold transition disabled:opacity-50`}
            >
              {avatarLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
          )}

          <p className={`${t.textPrimary} font-semibold text-lg mt-2`}>
            {user?.username}
          </p>
          <p className={`${t.textSecondary} text-sm`}>{user?.email}</p>
          <p className={`${t.textSecondary} text-xs mt-1`}>
            Click on photo to change
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${t.border} px-6`}>
          <button
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'profile'
                ? `${t.accentText} border-current`
                : `${t.textSecondary} border-transparent`
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'password'
                ? `${t.accentText} border-current`
                : `${t.textSecondary} border-transparent`
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-5">
          {success && (
            <div className="bg-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              ❌ {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className={`${t.textSecondary} text-xs font-semibold uppercase mb-1 block`}>
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
                />
              </div>
              <div>
                <label className={`${t.textSecondary} text-xs font-semibold uppercase mb-1 block`}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className={`w-full ${t.accent} ${t.accentHover} text-white py-3 rounded-lg font-semibold transition disabled:opacity-50`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <div>
                <label className={`${t.textSecondary} text-xs font-semibold uppercase mb-1 block`}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
                />
              </div>
              <div>
                <label className={`${t.textSecondary} text-xs font-semibold uppercase mb-1 block`}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
                />
              </div>
              <div>
                <label className={`${t.textSecondary} text-xs font-semibold uppercase mb-1 block`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
                />
              </div>
              <button
                onClick={handleUpdatePassword}
                disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className={`w-full ${t.accent} ${t.accentHover} text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;