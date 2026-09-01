'use client'

import { ArrowLeft } from 'lucide-react'

export function VivafyHeader() {
  return (
     <header className="mb-8 flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/header-logo-A3UOMoQT1FAEXrocyLi5nT8dHjXfxH.png" alt="Vivafy AI" className="size-10 rounded-xl bg-[#08051f] object-cover shadow-[0_4px_14px_rgba(31,14,106,0.18)]" /><span className="text-lg font-semibold tracking-tight">vivafy <span className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] bg-clip-text text-transparent">AI</span></span></div>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </header>
  )
}

export const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(23,213,218,0.2)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70'
export const panel = 'rounded-[2rem] border border-[#e8e8f0] bg-[linear-gradient(145deg,#fbfaff_0%,#ffffff_58%,#f4f0ff_100%)] p-6 shadow-[0_20px_60px_rgba(91,45,190,.08)] sm:p-8'
export const inputClass = 'border-[#e2e2eb] bg-white text-[#33334d] transition hover:border-[#b42ed4] hover:bg-[#fbf5ff] focus:border-[#7435df] focus:bg-[#fbf5ff] focus:ring-[#7435df]/20'
