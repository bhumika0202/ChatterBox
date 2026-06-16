import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../utils/theme';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const t = themes[theme];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/auth/register', form);
      login(data);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.bgMain} flex items-center justify-center`}>
      <div className={`${t.bgSidebar} p-8 rounded-2xl shadow-lg w-full max-w-md relative`}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 ${t.textSecondary} text-xl`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <h2 className={`text-3xl font-bold ${t.textPrimary} mb-2 text-center`}>
          Create Account 🚀
        </h2>
        <p className={`${t.textSecondary} text-center mb-6`}>
          Join ChatterBox today
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`w-full ${t.bgInput} ${t.textPrimary} px-4 py-3 rounded-lg outline-none focus:ring-2 ${t.accentRing} ${t.placeholder}`}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !form.email || !form.password || !form.username}
            className={`w-full ${t.accent} ${t.accentHover} text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Creating account...
              </span>
            ) : 'Register'}
          </button>
        </div>

        <p className={`${t.textSecondary} text-center mt-6 text-sm`}>
          Already have an account?{' '}
          <Link to="/login" className={`${t.accentText} hover:underline`}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;