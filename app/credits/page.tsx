'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Check, ArrowLeft, X } from 'lucide-react';
import { VivafyHeader, primaryButton } from '@/components/vivafy-header';

interface Plan {
  name: string;
  credits: number;
  url: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Vivafy AI - Front End',
    credits: 500,
    url: 'https://vip.launchspecial.net/vivafyai/',
  },
  {
    name: 'Vivafy AI - Platinum Edition',
    credits: 800,
    url: 'https://vip.launchspecial.net/vivafyai/otos/platinum',
  },
  {
    name: 'Vivafy AI - Agentic PRO',
    credits: 1000,
    url: 'https://vip.launchspecial.net/vivafyai/otos/agentic',
  },
  {
    name: 'Vivafy AI Studio',
    credits: 1100,
    url: 'https://vip.launchspecial.net/vivafyai/otos/studio',
    highlighted: true,
  },
  {
    name: 'Vivafy AI - Reseller',
    credits: 1200,
    url: 'https://vip.launchspecial.net/vivafyai/otos/reseller',
  },
  {
    name: 'Vivafy AI - Whitelabel',
    credits: 1500,
    url: 'https://vip.launchspecial.net/vivafyai/otos/whitelabel',
  },
];



export default function MyCreditsPage() {
  const router = useRouter();
  const [userPackage, setUserPackage] = useState<string>('');
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [currentPlanUrl, setCurrentPlanUrl] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('package, credits')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error(error);
            return;
          }

          if (data) {
            setUserPackage(data.package || 'Free Plan');
            setUserCredits(
              typeof data.credits === 'number' ? data.credits : 0
            );
            
            // Find the plan URL based on current package
            const currentPlan = plans.find(
              (p) => p.name === data.package
            );
            if (currentPlan) {
              setCurrentPlanUrl(currentPlan.url);
            }
          }
        }
      } catch (error) {
        console.error('[v0] Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <VivafyHeader />
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Vivafy AI account</p><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Billing & Credits</h1><p className="mt-2 max-w-xl text-sm text-muted-foreground">Manage your current plan, track your balance, and unlock more creative power.</p></div><button onClick={() => setTopUpModalOpen(true)} className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">Top Up Credits</button></div>

        {/* Current Plan Card - Premium Style */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-white/5 rounded-2xl" />
          </div>
        ) : (
          <div className="mb-20">
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#5b5a98_0%,#8b2de2_55%,#17d5da_100%)] p-7 text-white shadow-2xl shadow-primary/20 md:p-10">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
              <div className="relative">
                <p className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
                  Current Plan
                </p>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="mb-2 max-w-xl text-3xl font-bold text-white sm:text-5xl">
                      {userPackage}
                    </h2>
                    <p className="text-white">Active Plan</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
                      Credit Balance
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-white">
                        {userCredits.toLocaleString()}
                      </span>
                      <span className="text-white text-lg">Credits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}

        {/* Features Section */}
        {/* <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Available Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              >
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Upgrade Plans Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Choose your next level
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-lg border transition-all hover:shadow-lg ${
                  plan.highlighted
                    ? 'bg-white border-primary/40 shadow-xl shadow-primary/10 ring-2 ring-primary/20 xl:-translate-y-1'
                    : 'bg-white border-border hover:border-primary/30 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-4 py-1 text-xs font-bold text-white shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  <h3 className="mb-2 text-lg font-bold leading-snug text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <p className="text-4xl font-bold tracking-tight text-primary">
                      {plan.credits.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Credits
                    </p>
                  </div>

                  <div className="flex-grow" />

                  <a
                    href={plan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all text-center ${
                      plan.highlighted
                        ? 'bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:opacity-90'
                        : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-white'
                    }`}
                  >
                    Upgrade
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-14 rounded-2xl border border-border bg-muted/50 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-foreground mb-4">
            About Our Plans
          </h3>
        
          <p className="text-black leading-relaxed">
            Credits are consumed based on the complexity and processing time of
            your AI generation tasks. Start with a plan that suits your needs
            and upgrade anytime to access more credits.
          </p>
        </div>

        {/* Top Up Modal */}
        {topUpModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40"
              onClick={() => setTopUpModalOpen(false)}
            />
            <div className="fixed top-24 right-4 md:right-8 bg-white border border-primary/50 rounded-xl shadow-2xl max-w-sm w-full md:w-96 z-50 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-foreground">Top Up Credits</h2>
                <button
                  onClick={() => setTopUpModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-all text-muted-foreground hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-3 pb-6 border-b border-white/10">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Current Plan
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {userPackage}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {userCredits.toLocaleString()} credits remaining
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] border border-primary/30 rounded-xl p-5">
                    <p className="text-gray-300 text-sm font-semibold mb-4">
                      Ready to upgrade? Contact our team:
                    </p>
                    <a
                      href="mailto:ojjames@gmail.com"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)]  text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-foreground rounded-lg font-semibold transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      ojjames@gmail.com
                    </a>
                  </div>

                  {currentPlanUrl && (
                    <div className="space-y-3 pt-2">
                      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Or visit your plan page
                      </p>
                      <a
                        href={currentPlanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 border border-primary/30 text-foreground rounded-lg font-semibold transition-all"
                      >
                        <span>{userPackage}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
