import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserPlus } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await signUp(email, password, fullName, company);
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
        <h2 className="text-lg font-bold text-slate-100">Create Account</h2>
        <p className="text-xs text-slate-400 mt-1">
          Get started with ProductIQ AI industrial product intelligence.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Alex Vance"
        required
      />

      <Input
        label="Company / Enterprise"
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Industrial Systems Inc."
        required
      />

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

      <div className="pt-2">
        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
