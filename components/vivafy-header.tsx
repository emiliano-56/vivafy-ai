'use client'

import { ArrowLeft } from 'lucide-react'

export function VivafyHeader() {
  return (
    <header className="mx-auto mb-8 flex max-w-7xl items-center justify-between border-b border-[#e8e8f0] px-6 pb-5 pt-6 lg:px-10">
      <div className="flex items-center gap-3">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c499285c-186e-4c66-8181-3b746e8fa908-d5JlRpN182u3UULfog6rqqzKJQqZK5.png" alt="Vivafy AI" className="size-10 rounded-xl bg-white object-contain p-1 shadow-sm" />
        <span className="text-lg font-semibold tracking-tight text-[#252548]">vivafy <span className="text-[#5b5a98]">AI</span></span>
      </div>
      <button onClick={() => { window.location.href = '/dashboard' }} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#42425b] transition-colors hover:bg-[#f7f7fb]">
        <ArrowLeft data-icon="inline-start" />Back to Home
      </button>
    </header>
  )
}

export const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b5a98] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#48477d] disabled:cursor-wait disabled:opacity-70'
export const panel = 'rounded-[2rem] border border-[#e8e8f0] bg-[#fbfbfd] p-6 shadow-[0_20px_60px_rgba(91,90,152,.08)] sm:p-8'
export const inputClass = 'border-[#e2e2eb] bg-white text-[#33334d] transition hover:border-[#f26b43] hover:bg-[#fff8f5] focus:border-[#f26b43] focus:bg-[#fff8f5] focus:ring-[#f26b43]/20'
