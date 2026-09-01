"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Gift,
  TrendingUp,
  BadgeDollarSign,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { VivafyHeader, primaryButton, inputClass } from "@/components/vivafy-header";

export default function ResellerPage() {
  return (
    <main className="min-h-screen bg-white text-foreground">
      {/* Top Navigation */}
<VivafyHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-primary/30 bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/10 px-4 py-2 text-sm text-primary">
            Earn 100% Commission
          </div>

          <h2 className="text-5xl font-bold leading-tight md:text-6xl">
            Partner with <span className="text-primary">Zoop AI</span>
            <br />
            and Earn Every Sale
          </h2>

          <p className="mt-8 text-lg leading-8 text-muted-foreground">
            Share the power of AI-generated content with your audience and
            receive <span className="font-semibold text-white">100% commission</span>
            on every qualified customer you refer.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-8 py-6 text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85">
              Request Your Affiliate Link
            </Button>

            <Button
              variant="outline"
              className="border-gray-400/30 bg-gray-400/5 px-8 py-6 text-muted-foreground hover:bg-gray-400 hover:text-black"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* What You'll Promote */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <h2 className="mb-5 text-3xl font-bold">
            What You'll Promote
          </h2>

          <p className="text-lg leading-8 text-muted-foreground">
          vivafy AI empowers content creators, agencies, educators, marketers,
            entrepreneurs, and businesses to generate stunning AI videos,
            comic books, animated stories, educational content, social media
            visuals, marketing assets, and much more using powerful AI tools.
          </p>
        </div>
      </section>

      {/* Why Zoop AI */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Why Choose Zoop AI?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <Sparkles className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              High-Demand AI Platform
            </h3>
            <p className="text-muted-foreground">
              Help creators, educators, agencies, and businesses unlock
              professional AI content creation in minutes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <BadgeDollarSign className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              100% Commission
            </h3>
            <p className="text-muted-foreground">
              Keep every dollar from every qualified sale. No hidden fees or
              deductions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <TrendingUp className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Long-Term Growth
            </h3>
            <p className="text-muted-foreground">
              Build recurring income while promoting one of the fastest-growing
              AI content creation platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Join Network */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl border border-primary/20 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Join Our Network
              </h2>

              <p className="mt-4 text-muted-foreground">
                Get your unique affiliate link through Launchpad JV.
                Track every referral automatically and watch your
                earnings grow.
              </p>
            </div>

            <Share2 className="h-20 w-20 text-primary" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-14 text-center text-4xl font-bold">
          How It Works
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              number: "1",
              title: "Get Approved",
              desc: "Request your affiliate link and join our growing reseller network.",
            },
            {
              number: "2",
              title: "Promote & Share",
              desc: "Share your unique link via email, social media, YouTube, or your website.",
            },
            {
              number: "3",
              title: "Earn 100%",
              desc: "Receive full commission for every qualified sale made through your link.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-white/10 bg-white/5 p-8"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-xl font-bold">
                {item.number}
              </div>

              <h3 className="mb-4 text-xl font-semibold">{item.title}</h3>

              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-10 text-center text-4xl font-bold">
          Your Benefits
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            "100% commission on every sale",
            "No recurring billing or hidden fees",
            "Unique affiliate tracking link",
            "Marketing materials provided",
            "Dedicated reseller support",
            "Recurring revenue potential",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <CheckCircle2 className="text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audience */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-4xl font-bold">
          Target Audience
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-muted-foreground">
          Perfect for promoting to creators, agencies, educators,
          freelancers, marketers, and entrepreneurs looking to create
          high-quality AI content at scale.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {[
            "Content Creators",
            "Agencies",
            "Publishers",
            "Educators",
            "Marketers",
            "Entrepreneurs",
          ].map((item) => (
            <div
              key={item}
              className="rounded-full border border-primary/30 bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/10 px-6 py-3 text-primary"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl border border-primary/20 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] p-12 text-center">
          <Gift className="mx-auto mb-6 h-14 w-14 text-primary" />

          <h2 className="text-4xl font-bold">
            Ready to Start Earning?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Join the vivafy AI Reseller Program today and start building
            recurring revenue by sharing one of the most powerful AI
            content generation platforms with your audience.
          </p>

          <Button className="mt-10 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-10 py-6 text-lg hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85">
            Request Your Affiliate Link
          </Button>

          <p className="mt-8 text-muted-foreground">
            Questions? We're here to help.
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5 text-primary" />
            Team Vivafy AI
          </div>
        </div>
      </section>
    </main>
  );
}
