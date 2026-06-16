import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../utils/theme';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const { data } = await axios.post('/auth/login', form);
      login(data);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          Welcome Back 👋
        </h2>
        <p className={`${t.textSecondary} text-center mb-6`}>
          Login to ChatterBox
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
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
            disabled={loading || !form.email || !form.password}
            className={`w-full ${t.accent} ${t.accentHover} text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className={`${t.textSecondary} text-center mt-6 text-sm`}>
          Don't have an account?{' '}
          <Link to="/register" className={`${t.accentText} hover:underline`}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;