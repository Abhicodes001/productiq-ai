import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.engineer@industrial-solutions.com');
  const [password, setPassword] = useState('demo123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">
          Sign in to access your ProductIQ AI intelligence dashboard.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      <Input
        label="Work Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="engineer@company.com"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none hover:text-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-500 focus:ring-red-500/40 focus:ring-offset-slate-950 cursor-pointer accent-red-500"
          />
          <span>Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => alert('Password reset instructions have been sent to your email.')}
          className="text-slate-400 hover:text-red-400 transition-colors text-xs"
        >
          Forgot password?
        </button>
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
          <LogIn className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-red-400 font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
};
