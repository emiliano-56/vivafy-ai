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
    <div className="min-h-screen flex flex-col overflow-hidden bg-[linear-gradient(135deg,#05021f_0%,#24105e_45%,#e51e83_72%,#ff5b48_100%)] text-[#ffffff]">
      {/* Main Content */}
      <main className="flex-1 flex items-stretch justify-center p-0">
        <div className="grid min-h-screen w-full overflow-hidden rounded-none border-0 bg-transparent lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative order-2 hidden min-h-screen overflow-hidden bg-[linear-gradient(135deg,#21106f_0%,#5315a7_38%,#e51e83_70%,#0878cb_100%)] bg-cover bg-center lg:block"
            style={{ backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iiiss-xq7dS3xEy489HL3mnMIK5BHs8fUVvn.png)', backgroundSize: '100% auto', backgroundPosition: 'right center', backgroundRepeat: 'no-repeat' }}
          >
            <motion.img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iiiss-xq7dS3xEy489HL3mnMIK5BHs8fUVvn.png"
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, scale: 1.04, x: 18 }}
              animate={{ opacity: 1, scale: [1.04, 1.08, 1.04], x: [18, 0, 18] }}
              transition={{ opacity: { duration: 0.8, delay: 0.2 }, scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 10, repeat: Infinity, ease: 'easeInOut' } }}
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-full object-contain object-right"
            />
            <div className="relative hidden h-full flex-col items-center justify-start gap-7 p-10 text-[#ffffff]" aria-hidden="true">
              <motion.img
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-logo-Dww63hMTeNQcRt14HmV5VEtxAUnAnF.png"
                alt="Vivafy AI logo"
                className="h-auto w-52 object-contain"
              />
              <div className="space-y-3">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff7fd0]"
                >
                  Create · Generate · Elevate
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="max-w-md text-center text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance"
                >
                  <span>Make something</span>{' '}<span className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] bg-clip-text text-transparent">remarkable.</span>
                </motion.h1>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={cyclingFeatures[featureIndex].text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-md text-center text-lg leading-7 text-[#c4bfd9]"
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
            className="order-1 flex min-h-screen items-center bg-[#070329] p-3 text-[#ffffff] sm:p-5"
          >
            <div className="w-full max-w-md space-y-5">
              <div className="space-y-5 text-center">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-logo-Dww63hMTeNQcRt14HmV5VEtxAUnAnF.png" alt="Vivafy AI" className="mx-auto h-auto w-48 object-contain" />
                <p className="bg-[linear-gradient(90deg,#ff4ab8_0%,#ff9b4a_48%,#18d6d0_100%)] bg-clip-text text-sm font-semibold uppercase tracking-[0.28em] text-transparent">Create&nbsp; • &nbsp;Generate&nbsp; • &nbsp;Elevate</p>
                <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#ffffff] sm:text-5xl">Make something <span className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] bg-clip-text text-transparent">remarkable.</span></h1>
                <p className="text-lg leading-7 text-[#c4bfd9]">Generate professional videos.<br />Your next creative chapter starts here.</p>
              </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className={`relative transition-all duration-300 rounded-lg overflow-hidden ${emailFocused ? 'ring-2 ring-ring/50' : ''
                  }`}>
                  <Mail className={`absolute left-3 top-3.5 w-5 h-5 transition-colors duration-300 ${emailFocused ? 'text-accent' : 'text-gray-500'
                    }`} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="h-14 rounded-xl border border-[#ffffff26] bg-[#100a38] pl-12 text-[#ffffff] placeholder:text-[#aaa5c5] transition-all duration-300 focus:border-[#9b5cff] focus:outline-none"
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
                    className="h-14 rounded-xl border border-[#ffffff26] bg-[#100a38] pl-12 pr-12 text-[#ffffff] placeholder:text-[#aaa5c5] transition-all duration-300 focus:border-[#9b5cff] focus:outline-none"
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
                className="mt-6 w-full rounded-xl bg-[linear-gradient(90deg,#4d1dff_0%,#b42ed4_48%,#ff5c45_100%)] py-5 text-lg font-semibold text-[#ffffff] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                <span className="ml-2">→</span>
              </Button>
            </form>

            <p className="text-center text-base text-[#aaa5c5]">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="font-semibold text-[#9b5cff] transition-opacity hover:opacity-80">Sign up</a>
            </p>
            </div>
          </motion.section>
        </div>
      </main>

    </div>
  );
}
