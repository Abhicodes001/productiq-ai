import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogIn, ArrowRight, Lock, KeyRound, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

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

  const handleFillDemo = () => {
    setEmail('alex.engineer@industrial-solutions.com');
    setPassword('demo123456');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up-fade">
      {/* Header */}
      <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>Welcome Back</span>
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </h2>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900/60 hover:border-red-500/60 transition-all duration-300 flex items-center gap-1.5 shadow-sm group"
            title="Auto-fill demo engineer login"
          >
            <Sparkles className="w-3 h-3 text-red-400 group-hover:rotate-12 transition-transform" />
            <span>Auto-fill Demo</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sign in to access your enterprise ProductIQ AI product intelligence workspace.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-xs text-rose-300 font-medium flex items-center gap-2.5 animate-shake shadow-lg shadow-rose-950/30">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Group with hover/focus animations */}
      <div className="space-y-4 pt-1">
        <div className="transition-transform duration-200 focus-within:scale-[1.01]">
          <Input
            label="Work Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@company.com"
            required
          />
        </div>

        <div className="transition-transform duration-200 focus-within:scale-[1.01]">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none hover:text-slate-100 transition-colors group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-500 focus:ring-red-500/40 focus:ring-offset-slate-950 cursor-pointer accent-red-500 transition-transform group-hover:scale-110"
          />
          <span>Remember this session</span>
        </label>

        <button
          type="button"
          onClick={() => alert('Password reset instructions have been sent to your registered email.')}
          className="text-slate-400 hover:text-red-400 transition-colors text-xs hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Authenticating Session...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 text-red-200" />
            </>
          )}
        </Button>
      </div>

      {/* Sign Up Redirect */}
      <div className="text-center pt-3 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Don't have an enterprise account?{' '}
          <Link to="/signup" className="text-red-400 font-bold hover:text-red-300 hover:underline transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
};

