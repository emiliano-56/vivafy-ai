"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, ImageIcon, Mail, RefreshCw, Share2, Video, X } from "lucide-react"
import { VivafyHeader } from "@/components/vivafy-header"
import { supabase } from "@/lib/supabase"

type LibraryItem = {
  id: string
  url: string
  created_at?: string
  type: "image" | "video"
  name: string
}

function getMediaType(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ? "video" : "image"
}

function getFileName(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "Generated file")
  } catch {
    return "Generated file"
  }
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<LibraryItem | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    setError("")

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      setUserId(null)
      setItems([])
      setLoading(false)
      return
    }

    setUserId(authData.user.id)
    const { data, error: imagesError } = await supabase
      .from("images")
      .select("id, url, created_at")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })

    if (imagesError) {
      setError(imagesError.message)
      setItems([])
    } else {
      setItems((data ?? []).map((item: { id: string; url: string; created_at?: string }) => ({
        ...item,
        type: getMediaType(item.url),
        name: getFileName(item.url),
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])

  const downloadFile = async (item: LibraryItem) => {
    const response = await fetch(item.url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }

  const shareFile = async (item: LibraryItem) => {
    if (navigator.share) {
      await navigator.share({ title: "My Vivafy creation", url: item.url })
    } else {
      await navigator.clipboard.writeText(item.url)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-[#19193f]">
      <VivafyHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#8b2de2]">Your workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Creation library</h1>
            <p className="mt-2 max-w-xl text-[#6d6d8b]">Browse, download, and share the images and videos you&apos;ve generated with Vivafy.</p>
          </div>
          <button type="button" onClick={loadLibrary} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#8b2de233] bg-white px-4 py-2.5 text-sm font-semibold text-[#5b2c9e] shadow-sm transition hover:border-[#17d5da99] hover:bg-[#fbf8ff]">
            <RefreshCw className="size-4" /> Refresh
          </button>
        </div>

        {!userId && !loading && (
          <div className="rounded-3xl border border-[#8b2de233] bg-white p-10 text-center shadow-[0_12px_35px_rgba(39,30,100,0.06)]">
            <h2 className="text-xl font-semibold">Sign in to view your creations</h2>
            <p className="mt-2 text-[#6d6d8b]">Your generated files are private to your account.</p>
          </div>
        )}

        {loading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-2xl bg-white shadow-sm" />)}</div>}
        {error && !loading && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Unable to load your library: {error}</div>}
        {!loading && !error && userId && items.length === 0 && <div className="rounded-3xl border border-dashed border-[#8b2de255] bg-white p-14 text-center"><ImageIcon className="mx-auto size-10 text-[#8b2de2]" /><h2 className="mt-4 text-xl font-semibold">Your library is empty</h2><p className="mt-2 text-[#6d6d8b]">Generated media will appear here automatically.</p></div>}

        {!loading && !error && items.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => (
          <article key={item.id || item.url} className="group overflow-hidden rounded-2xl border border-[#26265714] bg-white shadow-[0_10px_30px_rgba(39,30,100,0.06)]">
            <button type="button" onClick={() => setSelected(item)} className="relative block aspect-square w-full overflow-hidden bg-[#eeecf7] text-left">
              {item.type === "video" ? <video src={item.url} className="size-full object-cover" muted preload="metadata" /> : <img src={item.url} alt={item.name} className="size-full object-cover transition duration-300 group-hover:scale-105" />}
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#19193fcc] px-2.5 py-1 text-xs font-semibold text-white">{item.type === "video" ? <Video className="size-3" /> : <ImageIcon className="size-3" />}{item.type}</span>
            </button>
            <div className="flex items-center justify-between gap-2 p-3"><span className="truncate text-xs text-[#777795]">{item.name}</span><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => downloadFile(item)} aria-label={`Download ${item.name}`} className="rounded-lg p-2 text-[#5b5b7d] transition hover:bg-[#f1edff] hover:text-[#8b2de2]"><Download className="size-4" /></button><button type="button" onClick={() => shareFile(item)} aria-label={`Share ${item.name}`} className="rounded-lg p-2 text-[#5b5b7d] transition hover:bg-[#e9fbfc] hover:text-[#0c9ba2]"><Share2 className="size-4" /></button></div></div>
          </article>
        ))}</div>}
      </section>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10102dcc] p-5" role="dialog" aria-modal="true" aria-label="Preview generated file"><div className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"><button type="button" onClick={() => setSelected(null)} aria-label="Close preview" className="absolute right-5 top-5 z-10 rounded-full bg-[#19193fcc] p-2 text-white"><X className="size-5" /></button>{selected.type === "video" ? <video src={selected.url} controls autoPlay className="max-h-[78vh] max-w-full rounded-xl" /> : <img src={selected.url} alt={selected.name} className="max-h-[78vh] max-w-full rounded-xl object-contain" />}<div className="flex flex-wrap items-center justify-end gap-2 px-1 pt-3"><button type="button" onClick={() => downloadFile(selected)} className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-4 py-2 text-sm font-semibold text-white"><Download className="size-4" /> Download</button><button type="button" onClick={() => shareFile(selected)} className="inline-flex items-center gap-2 rounded-xl border border-[#8b2de233] px-4 py-2 text-sm font-semibold text-[#5b2c9e]"><Share2 className="size-4" /> Share</button><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selected.url)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#8b2de233] px-4 py-2 text-sm font-semibold text-[#4267b2]"><Share2 className="size-4" /> Facebook</a><a href={`mailto:?subject=${encodeURIComponent("My Vivafy creation")}&body=${encodeURIComponent(selected.url)}`} className="inline-flex items-center gap-2 rounded-xl border border-[#8b2de233] px-4 py-2 text-sm font-semibold text-[#5b2c9e]"><Mail className="size-4" /> Email</a></div></div></div>}
    </main>
  )
}
