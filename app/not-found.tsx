'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070329] px-6 text-white">
      <section className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)]">
          <Sparkles className="size-7" />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#17d5da]">404 · Page not found</p>
        <h1 className="text-balance font-serif text-4xl font-semibold tracking-tight sm:text-6xl">This creative space is missing.</h1>
        <p className="mx-auto mt-5 max-w-md text-pretty leading-7 text-[#c4bfd9]">The page you&apos;re looking for may have moved or no longer exists.</p>
        <Link href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
      </section>
    </main>
  )
}
