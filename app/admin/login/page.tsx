'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn, supabase } from '@/lib/db';

const ADMIN_EMAIL = "ojjames@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign in user
      const data = await signIn(email, password);

      const userEmail = data.user?.email;

      console.log('[ADMIN] login success:', userEmail);

      if (!userEmail) {
        setError('Login failed. No user found.');
        return;
      }

      // 2. Ensure session is synced
      await supabase.auth.getSession();

      // 3. SIMPLE ADMIN CHECK (NO API, NO DB, NO RLS)
      const isAdmin =
        userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('Access denied. You are not an admin.');
        return;
      }

      // 4. Redirect to dashboard
      router.push('/admin/dashboard');

    } catch (err: any) {
      console.error('[ADMIN LOGIN ERROR]', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black border border-purple-500/20 rounded-2xl p-8 shadow-lg shadow-purple-500/10">

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Admin Login
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Secure access to ZoopAI Admin Panel
        </p>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin email"
                className="pl-10 bg-black border border-purple-500/20 text-white focus:border-purple-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="pl-10 pr-10 bg-black border border-purple-500/20 text-white focus:border-purple-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-purple-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Button */}
          <Button
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          ZoopAI Admin Portal
        </p>
      </div>
    </div>
  );
}