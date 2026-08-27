'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, BookOpen, Film, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/db';

const cyclingFeatures = [
  { text: 'Create stunning stories', icon: BookOpen },
  { text: 'Generate professional videos', icon: Film },
  { text: 'Generate beautiful images', icon: ImageIcon },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
      await signIn(email, password);
      console.log('[v0] Sign in successful');
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('[v0] Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIndex((prev) => (prev + 1) % cyclingFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = cyclingFeatures[featureIndex].icon;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative hidden min-h-[560px] overflow-hidden lg:block"
            style={{ backgroundColor: '#5b5a98' }}
          >
            <div className="relative flex h-full flex-col justify-between gap-6 p-7 text-primary-foreground">
              <motion.img
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c499285c-186e-4c66-8181-3b746e8fa908-d5JlRpN182u3UULfog6rqqzKJQqZK5.png"
                alt="Vivafy AI logo"
                className="h-auto w-44 rounded-2xl bg-white/95 p-3 shadow-lg"
              />
              <div className="space-y-3">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="text-xs font-medium uppercase tracking-[0.22em] text-primary-foreground/75"
                >
                  Create · Generate · Elevate
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="max-w-sm text-4xl font-semibold leading-tight text-balance"
                >
                  Make something remarkable.
                </motion.h1>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={cyclingFeatures[featureIndex].text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-sm text-sm leading-6 text-primary-foreground/80"
                  >
                    {cyclingFeatures[featureIndex].text}. Your next creative chapter starts here.
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
            className="flex items-center p-6 sm:p-10"
          >
            <div className="w-full max-w-md space-y-8">
              {/* Welcome Section */}
              <div>
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">Welcome back</p>
                
                <AnimatePresence mode="wait">
                  <motion.p
                    key={cyclingFeatures[featureIndex].text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-muted-foreground"
                  >
                    Sign in to {cyclingFeatures[featureIndex].text.toLowerCase()}.
                  </motion.p>
                </AnimatePresence>
              </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <div className={`relative transition-all duration-300 rounded-lg overflow-hidden ${emailFocused ? 'ring-2 ring-ring/50' : ''
                  }`}>
                  <Mail className={`absolute left-3 top-3.5 w-5 h-5 transition-colors duration-300 ${emailFocused ? 'text-accent' : 'text-gray-500'
                    }`} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="pl-10 bg-background text-foreground placeholder-muted-foreground transition-all duration-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className={`relative transition-all duration-300 rounded-lg overflow-hidden ${passwordFocused ? 'ring-2 ring-ring/50' : ''
                  }`}>
                  <Lock className={`absolute left-3 top-3.5 w-5 h-5 transition-colors duration-300 ${passwordFocused ? 'text-accent' : 'text-gray-500'
                    }`} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="pl-10 pr-10 bg-background text-foreground placeholder-muted-foreground transition-all duration-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-accent transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-2">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
      className="w-4 h-4 rounded border-ring/30 bg-background accent-primary cursor-pointer"
    />

    <span className="text-sm text-muted-foreground">
      Remember me
    </span>
  </label>

  <a
    href="/password"
    className="text-sm text-accent hover:text-primary/80 transition-colors"
  >
    Forgot Password?
  </a>
</div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 rounded-lg mt-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <span className="ml-2">→</span>
              </Button>
            </form>

            {/* Footer Message */}
            {/* <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-transparent bg-gradient-to-r from-primary-400 to-pink-400 bg-clip-text font-semibold hover:opacity-80 transition-opacity">
                Create Account
              </a>
            </p> */}
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
        Vivafy AI · Create, generate, elevate.
      </footer>
    </div>
  );
}
