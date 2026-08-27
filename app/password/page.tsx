'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-foreground flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Forgot Your Password?
            </h1>
            <p className="text-foreground text-lg">
              No worries! Our support team is here to help you recover your account.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Card 1 */}
            <div className="relative overflow-hidden rounded-2xl bg-primary border border-purple-500/30 p-8">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-600/20 border border-purple-500/30">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Primary Support
                </h2>
                <p className="text-foreground text-sm">
                  Send a password recovery request to our primary support email.
                </p>
                <a
                  href="mailto:ojjames@gmail.com?subject=Password%20Recovery%20Request"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/85 text-white rounded-lg font-semibold transition-all mt-4"
                >
                  <Mail className="w-4 h-4" />
                  ojjames@gmail.com
                </a>
              </div>
            </div>

            {/* Email Card 2 */}
            <div className="relative overflow-hidden rounded-2xl bg-primary border border-purple-500/30 p-8">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-600/20 border border-purple-500/30">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Backup Support
                </h2>
                <p className="text-foreground text-sm">
                  Reach out to our backup support team for quick assistance.
                </p>
                <a
                  href="mailto:gdev615x@gmail.com?subject=Password%20Recovery%20Request"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/85 text-white rounded-lg font-semibold transition-all mt-4"
                >
                  <Mail className="w-4 h-4" />
                  gdev615x@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              How to recover your password:
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">1.</span>
                <span>Click on one of the email addresses above to start composing an email</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">2.</span>
                <span>In the email, provide your account email address and briefly describe the issue</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">3.</span>
                <span>Our team will review your request and send you password recovery instructions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">4.</span>
                <span>Follow the recovery instructions in the email to reset your password</span>
              </li>
            </ol>
          </div>

          {/* Additional Help */}
          <div className="text-center space-y-4">
            <p className="text-foreground">
              Need additional help? Our support team typically responds within 24 hours.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-foreground rounded-lg font-semibold transition-all"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
