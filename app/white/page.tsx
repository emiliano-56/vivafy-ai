"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  Palette,
  BookOpen,
  Zap,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WhiteLabelsPage() {
  return (
    <main className="min-h-screen bg-white text-foreground">
      {/* Top Navigation */}
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-border/60 px-6 py-5">
        <div className="flex items-center gap-3"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c499285c-186e-4c66-8181-3b746e8fa908-d5JlRpN182u3UULfog6rqqzKJQqZK5.png" alt="Vivafy AI" className="size-10 rounded-xl bg-white/95 object-contain p-1 shadow-sm" /><span className="text-lg font-semibold tracking-tight">vivafy <span className="text-primary">AI</span></span></div>
        <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black transition-colors rounded-lg hover:bg-white/5"><ArrowLeft size={16} />Back to Home</button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            Deploy Your Own Platform
          </div>

          <h2 className="text-5xl font-bold leading-tight md:text-6xl">
            White Label <span className="text-primary">Vivafy AI</span>
            <br />
            Under Your Brand
          </h2>

          <p className="mt-8 text-lg leading-8 text-muted-foreground">
            Deploy Vivafy AI under your own custom domain, brand, and logos. 
            Launch your own <span className="font-semibold text-foreground">AI content generation platform</span> 
            with complete branding control.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button className="bg-primary px-8 py-6 text-white hover:bg-primary/85">
              Get White Label Package
            </Button>

            <Button
              variant="outline"
              className="border-gray-400/30 bg-gray-400/5 px-8 py-6 text-muted-foreground hover:bg-gray-400 hover:text-black"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <h2 className="mb-5 text-3xl font-bold">
            What's Included in the White Label Package?
          </h2>

          <p className="text-lg leading-8 text-muted-foreground">
            Everything you need to launch your own AI content generation platform 
            with vivafy AI technology. Full backend, customizable frontend, and 
            comprehensive deployment guides included.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Platform Features
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <Code2 className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Deployable Backend
            </h3>
            <p className="text-muted-foreground">
              Optimized Python backend files for easy hosting configuration 
              and reliable server-side operations.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <Palette className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Customizable Frontend
            </h3>
            <p className="text-muted-foreground">
              Compiled Next.js frontend build files with dynamic branding 
              variables for full customization.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <BookOpen className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Setup Guides
            </h3>
            <p className="text-muted-foreground">
              Step-by-step custom domain mapping and DNS configuration 
              guides for seamless deployment.
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Why Choose White Label?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <Lock className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Complete Control
            </h3>
            <p className="text-muted-foreground">
              Fully branded experience with your own domain and custom branding.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <Zap className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Easy Deployment
            </h3>
            <p className="text-muted-foreground">
              Pre-configured backend and frontend with simple setup guides 
              and minimal configuration required.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <BookOpen className="mb-5 h-10 w-10 text-primary" />
            <h3 className="mb-3 text-xl font-semibold">
              Full Documentation
            </h3>
            <p className="text-muted-foreground">
              Comprehensive guides for domain mapping, DNS configuration, 
              and customization.
            </p>
          </div>
        </div>
      </section>

      {/* Package Contents */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Package Contents
        </h2>

        <div className="mx-auto max-w-3xl space-y-4">
          {[
            "Complete Python backend source code",
            "Next.js frontend build files with branding variables",
            "Database migration and setup scripts",
            "Docker configuration for easy deployment",
            "Custom domain setup guides",
            "DNS configuration documentation",
            "SSL certificate setup instructions",
            "Branding customization guide",
            "API documentation and integration guides",
            "Email template customization",
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-foreground font-semibold text-sm">
                {index + 1}
              </div>
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Deployment */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl border border-primary/20 bg-primary p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl  text-white font-bold">
                Ready to Launch?
              </h2>

              <p className="mt-4 text-muted-foreground">
                Get your white label package and start deploying your 
                branded platform today.
              </p>
            </div>

            <Code2 className="h-20 w-20 text-primary" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-14 text-center text-4xl font-bold">
          Deployment Steps
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              number: "1",
              title: "Get Package",
              desc: "Download the complete white label package with all source code and documentation.",
            },
            {
              number: "2",
              title: "Customize Branding",
              desc: "Update logos, colors, domain names, and customize the platform to match your brand.",
            },
            {
              number: "3",
              title: "Deploy & Launch",
              desc: "Deploy to your hosting provider and launch your branded AI content platform.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-white/10 bg-white/5 p-8"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold">
                {item.number}
              </div>

              <h3 className="mb-4 text-xl font-semibold">{item.title}</h3>

              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-center text-4xl font-bold">
          Get Support
        </h2>

        <p className="mx-auto text-center text-muted-foreground max-w-2xl">
          Our team is here to help you deploy and customize your white label 
          platform. Access comprehensive documentation and dedicated support.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Button className="bg-primary px-8 py-6 text-foreground hover:bg-primary/85">
            View Documentation
          </Button>

          <Button
            variant="outline"
            className="border-gray-400/30 bg-gray-400/5 px-8 py-6 text-muted-foreground hover:bg-gray-400 hover:text-black"
          >
            Contact Support
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl border border-primary/20 bg-primary p-12 text-center">
          <Zap className="mx-auto mb-6 h-14 w-14 text-primary" />

          <h2 className="text-4xl font-bold">
            Launch Your Platform Today
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Get the complete white label package and deploy your own branded 
            AI content generation platform with vivafy AI technology.
          </p>

          <Button className="mt-10 bg-primary px-10 py-6 text-lg hover:bg-primary/85">
            Get White Label Package
          </Button>

          <p className="mt-8 text-muted-foreground">
            Questions? We're here to help.
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-lg font-semibold">
            <Code2 className="h-5 w-5 text-primary" />
            Team vivafy AI
          </div>
        </div>
      </section>
    </main>
  );
}
