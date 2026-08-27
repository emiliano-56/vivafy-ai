"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Download, Sparkles, X, ArrowLeft, Copy, Check, Save, Share2, Trash2, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Footer from "@/components/footer"
import ReactMarkdown from "react-markdown"
import { supabase } from "@/lib/supabase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])

  const [selectedStyle, setSelectedStyle] = useState("")
  const [selectedQuality, setSelectedQuality] = useState("")
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9")
  const [selectedLighting, setSelectedLighting] = useState("")
  const [selectedMood, setSelectedMood] = useState("")
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false })
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [aiMessages, setAiMessages] = useState([])
  const [aiShowLoading, setAiShowLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null)
  const [sharingImage, setSharingImage] = useState<string | null>(null)
  const [deletingImage, setDeletingImage] = useState<string | null>(null)

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const shareImage = async (imageUrl: string) => {
    if (!imageUrl) return
    setSharingImage(imageUrl)
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out my AI generated image!",
          url: imageUrl,
        })
      } else {
        await navigator.clipboard.writeText(imageUrl)
        setToast({ message: "Image URL copied to clipboard!", show: true })
        setTimeout(() => setToast({ message: "", show: false }), 3000)
      }
    } catch (err) {
      console.log("Share failed:", err)
    } finally {
      setSharingImage(null)
    }
  }

  const deleteImage = async (imageUrl: string) => {
    if (!user || !imageUrl) return
    setDeletingImage(imageUrl)
    try {
      const fileName = imageUrl.split("/").pop()
      console.log("[v0] Deleting image:", fileName, "URL:", imageUrl)
      
      // Delete from database first (more important)
      const { error: deleteError } = await supabase
        .from("images")
        .delete()
        .eq("url", imageUrl)
        .eq("user_id", user.id)
      
      if (deleteError) {
        console.log("[v0] Database delete error:", deleteError)
        throw deleteError
      }
      
      console.log("[v0] Database delete successful")
      
      // Delete from storage after
      const { error: storageError } = await supabase.storage
        .from("images")
        .remove([`${user.id}/${fileName}`])
      
      if (storageError) {
        console.log("[v0] Storage delete error:", storageError)
      }
      
      // Update local state
      setHistory((prev) => {
        const updated = prev.filter((img) => img !== imageUrl)
        console.log("[v0] History updated, new length:", updated.length)
        return updated
      })
      setFullscreenImage(null)
      setToast({ message: "Image deleted successfully", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)
    } catch (err) {
      console.log("[v0] Delete failed:", err)
      setToast({ message: "Failed to delete image", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)
    } finally {
      setDeletingImage(null)
    }
  }

  const styles = [
    { name: "Realistic", image: "https://ibb.co/mVPXmYJx" },
    { name: "Anime", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop" },
    { name: "Watercolor", image: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=200&h=200&fit=crop" },
    { name: "Oil Painting", image: "https://images.unsplash.com/photo-1549887534-f3e4d1faea7e?w=200&h=200&fit=crop" },
    { name: "Sketch", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop" },
    { name: "Cyberpunk", image: "https://images.unsplash.com/photo-1586253408409-04149c1f3c6f?w=200&h=200&fit=crop" },
    { name: "Fantasy", image: "https://images.unsplash.com/photo-1570706572429-2b8c16ca1a45?w=200&h=200&fit=crop" },
    { name: "Minimalist", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop" },
  ]

  const qualities = ["standard", "quality-high", "quality-ultra"]
  const aspectRatios = ["1:1", "4:3", "16:9", "9:16", "21:9", "3:2", "2:3"]
  const lightingOptions = ["Natural", "Studio", "Dramatic", "Cinematic"]
  const moodOptions = ["Calm", "Energetic", "Dark", "Vibrant"]

  const characterCount = prompt.length

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const loadImages = async () => {
      const { data } = await supabase
        .from("images")
        .select("url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) {
        setHistory(data.map((item: any) => item.url))
      }
    }

    loadImages()
  }, [user])

  const handleStyleSelect = (styleName) => {
    const newStyle = selectedStyle === styleName ? "" : styleName
    setSelectedStyle(newStyle)
    updateTextarea(basePromptText, newStyle, selectedQuality, selectedLighting, selectedMood)
  }

  const basePromptText = prompt.split(/style-|quality-|lighting-|mood-/)[0].trim()

  const updateTextarea = (basePrompt, style, quality, lighting, mood) => {
    let newPrompt = basePrompt
    const attributes = []
    if (style) attributes.push(`style-${style}`)
    if (quality) attributes.push(`quality-${quality}`)
    if (lighting) attributes.push(`lighting-${lighting}`)
    if (mood) attributes.push(`mood-${mood}`)

    if (attributes.length > 0) {
      newPrompt += ` ${attributes.join(" ")}`
    }
    setPrompt(newPrompt)
  }

  const nextStyleCarousel = () => {
    setStyleCarouselIndex((prev) => (prev + 2) % styles.length)
  }

  const prevStyleCarousel = () => {
    setStyleCarouselIndex((prev) => (prev - 2 + styles.length) % styles.length)
  }

  // Get display styles (2 at a time for carousel)
  const getDisplayStyles = () => {
    return [
      styles[styleCarouselIndex % styles.length],
      styles[(styleCarouselIndex + 1) % styles.length]
    ]
  }

  const handleGenerate = async () => {
    if (!basePromptText.trim()) return

    if (!user) {
      setError("You must be logged in")
      return
    }

    // Check credits
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      setError("Failed to check credits")
      return
    }

    if (profileData.credits < 10) {
      setError("Insufficient credits. You need 10 credits to generate an image.")
      return
    }

    setLoading(true)
    setError("")
    setImageUrl("")

    // Use the prompt that already has attributes from textarea
    let enhancedPrompt = prompt

    try {
      const response = await fetch("https://zoop-a1-v2.onrender.com/nano/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          output_format: "png",
          aspect_ratio: selectedAspectRatio,
        }),
      })

      const data = await response.json()

      if (data.success && data.image_url) {
        // Deduct credits
        await supabase
          .from('profiles')
          .update({ credits: profileData.credits - 10 })
          .eq('id', user.id)

        setImageUrl(data.image_url)
        // Add to history
        setHistory([data.image_url, ...history.slice(0, 9)])
      } else {
        setError(data.message || "Failed to generate image")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (urlToDownload?: string) => {
    const imageToDownload = urlToDownload || imageUrl
    if (!imageToDownload) return
    
    setDownloadingImage(imageToDownload)
    try {
      // Use proxy API to handle CORS
      const proxyResponse = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageToDownload })
      })
      
      const { base64, mimeType } = await proxyResponse.json()
      const binaryString = window.atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "generated-image.png"
      a.click()
      window.URL.revokeObjectURL(url)
      setToast({ message: "Image downloaded successfully", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)
    } catch (err) {
      console.error("Download failed:", err)
      setToast({ message: "Failed to download image", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)
    } finally {
      setDownloadingImage(null)
    }
  }

  const uploadToSupabase = async () => {
    if (!imageUrl || !user) {
      setToast({ message: "You must be logged in", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)
      return
    }

    try {
      setSaving(true)

      // Use proxy route to avoid CORS issues
      const proxyResponse = await fetch("/api/proxy-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      const proxyData = await proxyResponse.json()

      if (!proxyResponse.ok || !proxyData.base64) {
        throw new Error(proxyData.error || "Failed to fetch image")
      }

      // convert base64 back to blob
      const binaryString = atob(proxyData.base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: proxyData.mimeType })

      const fileName = `${user.id}/${Date.now()}.png`

      // upload to storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, blob, {
          contentType: "image/png",
        })

      if (uploadError) throw uploadError

      // get public URL
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName)

      const publicUrl = data.publicUrl

      // save in DB
      const { error: dbError } = await supabase.from("images").insert({
        url: publicUrl,
        user_id: user.id,
        prompt,
      })

      if (dbError) throw dbError

      // update UI instantly
      setHistory((prev) => [publicUrl, ...prev])
      
      // Show success toast
      setToast({ message: "Image saved successfully!", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)

    } catch (err) {
      console.error("[v0] Save error:", err)
      setToast({ message: "Failed to save image", show: true })
      setTimeout(() => setToast({ message: "", show: false }), 3000)
    } finally {
      setSaving(false)
    }
  }

  // Carousel auto-scroll
  useEffect(() => {
    if (history.length <= 5) return

    autoScrollTimerRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % history.length)
    }, 5000)

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current)
      }
    }
  }, [history.length])

  const scrollCarousel = (direction: "left" | "right") => {
    if (direction === "left") {
      setCarouselIndex((prev) => (prev === 0 ? history.length - 5 : prev - 1))
    } else {
      setCarouselIndex((prev) => (prev + 1) % history.length)
    }
  }

  const handleAiPrompt = async () => {
    if (!aiPrompt.trim()) return

    setAiLoading(true)
    setAiShowLoading(true)
    setAiResponse("")

    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || 'sk-b6ab7779c93441f8ae28dfbf0a9895d3'}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            ...aiMessages,
            { role: "user", content: `${aiPrompt}\n\nPlease respond in English only.` }
          ],
          stream: false,
        }),
      })

      const data = await response.json()

      if (data.choices && data.choices[0].message) {
        const assistantMessage = data.choices[0].message.content
        setAiShowLoading(false)
        setAiResponse(assistantMessage)
        setAiMessages([
          ...aiMessages,
          { role: "user", content: aiPrompt },
          { role: "assistant", content: assistantMessage }
        ])
        setAiPrompt("")
      } else {
        setAiShowLoading(false)
        setAiResponse("Error: Unable to get response from AI")
      }
    } catch (err) {
      console.error("[v0] AI Prompt error:", err)
      setAiShowLoading(false)
      setAiResponse("Error: Failed to connect to AI service")
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground/10 bg-background/95 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c499285c-186e-4c66-8181-3b746e8fa908-d5JlRpN182u3UULfog6rqqzKJQqZK5.png" alt="Vivafy AI" className="size-9 rounded-xl object-contain bg-white p-1" />
            <span className="text-lg font-semibold tracking-tight">vivafy <span className="text-primary">AI</span></span>
          </div>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><ArrowLeft size={18} />Back to Home</button>
        </div>
      </header>
      <div className="flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8">
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight"><Sparkles className="text-primary" />Image Generator</h1>
            <p className="mt-2 text-lg text-muted-foreground">Create stunning AI-generated images from text descriptions</p>
          </motion.div>

        {/* AI Modal Overlay */}
        {aiModalOpen && (
          <div className="fixed inset-0 bg-background/50 z-40" onClick={() => setAiModalOpen(false)} />
        )}

        {/* AI Modal */}
        <div
          className={`fixed right-0 top-0 h-screen w-96 bg-background border-l border-foreground/10 flex flex-col transition-transform duration-300 z-50 ${aiModalOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-white" />
              AI Assistant
            </h2>
            <button
              onClick={() => setAiModalOpen(false)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {aiMessages.length === 0 && (
              <div className="text-center text-muted-foreground mt-8">
                <p>Needs some prompts?</p>
              </div>
            )}
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-foreground"
                      }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ ...props }) => <h1 className="text-lg font-bold mt-2 mb-2" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-base font-bold mt-2 mb-2" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                            p: ({ ...props }) => <p className="mb-2" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                            li: ({ ...props }) => <li className="text-sm" {...props} />,
                            code: ({ ...props }) => <code className="bg-background/50 px-2 py-1 rounded text-xs" {...props} />,
                            pre: ({ ...props }) => <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto mb-2" {...props} />,
                            blockquote: ({ ...props }) => <blockquote className="border-l-4 border-purple-400 pl-4 italic text-muted-foreground mb-2" {...props} />,
                            table: ({ ...props }) => <table className="border-collapse border border-foreground/10 mb-2 text-xs" {...props} />,
                            th: ({ ...props }) => <th className="border border-foreground/10 px-2 py-1 bg-background/50" {...props} />,
                            td: ({ ...props }) => <td className="border border-foreground/10 px-2 py-1" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopyMessage(msg.content, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded mt-2"
                      title="Copy message"
                    >
                      {copiedIdx === idx ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {aiShowLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 text-foreground">
                  <p className="text-sm">
                    <span className="inline-block animate-bounce">.</span>
                    <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                    <span className="inline-block animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-foreground/10 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleAiPrompt()
                    }
                  }}
                  placeholder="Ask me something..."
                  className="flex-1 rounded-lg bg-background border border-ring px-4 py-2 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none max-h-24 overflow-y-auto"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {aiPrompt.length} characters
                </div>
              </div>
              <button
                onClick={handleAiPrompt}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium h-fit"
              >
                {aiLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Prompt</label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full rounded-lg bg-card border border-foreground/10 p-4 pr-12 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary min-h-[150px] resize-none shadow-sm"
                  />
                  <button
                    onClick={() => setAiModalOpen(true)}
                    className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                    title="Open AI Assistant"
                  >
                    <Sparkles size={18} className="text-white" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{characterCount} characters</span>
                </div>
              </div>

              {/* Choose a Style - Select Field */}
              <div>
                <label className="block text-sm font-medium mb-2">Choose a Style</label>
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.15 }}><Select value={selectedStyle} onValueChange={(value) => handleStyleSelect(value)}>
                  <SelectTrigger className="w-full rounded-lg bg-card border border-foreground/10 text-foreground shadow-sm hover:border-primary/70">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-ring">
                    {styles.map((style) => (
                      <SelectItem key={style.name} value={style.name}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select></motion.div>
              </div>

              {/* Quality & Aspect Ratio - Two Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <Select value={selectedQuality} onValueChange={(value) => {
                    setSelectedQuality(value)
                    updateTextarea(basePromptText, selectedStyle, value, selectedLighting, selectedMood)
                  }}>
                    <SelectTrigger className="w-full rounded-lg bg-card border border-foreground/10 text-foreground shadow-sm hover:border-primary/70">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-ring">
                      {qualities.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                  <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                    <SelectTrigger className="w-full rounded-lg bg-card border border-foreground/10 text-foreground shadow-sm hover:border-primary/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-ring">
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio} value={ratio}>
                          {ratio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lighting & Mood - Two Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Lighting</label>
                  <Select value={selectedLighting} onValueChange={(value) => {
                    setSelectedLighting(value)
                    updateTextarea(basePromptText, selectedStyle, selectedQuality, value, selectedMood)
                  }}>
                    <SelectTrigger className="w-full rounded-lg bg-card border border-foreground/10 text-foreground shadow-sm hover:border-primary/70">
                      <SelectValue placeholder="Select lighting" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-ring">
                      {lightingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mood</label>
                  <Select value={selectedMood} onValueChange={(value) => {
                    setSelectedMood(value)
                    updateTextarea(basePromptText, selectedStyle, selectedQuality, selectedLighting, value)
                  }}>
                    <SelectTrigger className="w-full rounded-lg bg-card border border-foreground/10 text-foreground shadow-sm hover:border-primary/70">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-ring">
                      {moodOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Generating..." : "Generate Image (10 credits)"}
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="lg:col-span-2">
            {error && (
              <div className="rounded-lg border border-red-500 bg-red-950 p-4 text-red-200 mb-6">
                {error}
              </div>
            )}

            {imageUrl ? (
              <div className="space-y-6">
                {/* Save Button */}
                <div className="flex gap-4 items-center flex-wrap">
                  <button
                    onClick={() => uploadToSupabase()}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    title={saving ? "Saving..." : "Save to Supabase"}
                  >
                    <Save size={20} className="text-foreground" />
                    <span className="text-foreground">{saving ? "Saving..." : "Save"}</span>
                  </button>
                </div>

                {/* Generated Image - Reduced Size */}
                <div className="rounded-lg overflow-hidden border border-foreground/10 bg-card p-4 shadow-sm flex justify-center mt-8">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    onClick={() => setFullscreenImage(imageUrl)}
                    className="max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </div>


              </div>
            ) : (
              <div className="mt-8 flex min-h-[292px] items-center justify-center rounded-2xl border border-dashed border-ring/50 bg-secondary/45 p-8 text-center shadow-sm">
                <div className="flex max-w-md flex-col items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/12 text-primary ring-8 ring-primary/5">
                    <ImageIcon size={30} strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-primary">
                      {loading ? "Creating something beautiful..." : "Your generated image will appear here"}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {loading ? "Your image is being prepared" : "Enter a prompt and click Generate to create your image"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* History - Carousel */}
            <div className="mt-6 rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold">History</h2>
                {history.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollCarousel("left")}
                      className="p-1.5 bg-primary text-white hover:bg-primary/90 rounded-full transition-colors"
                      title="Previous images"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => scrollCarousel("right")}
                      className="p-1.5 bg-primary text-white hover:bg-primary/90 rounded-full transition-colors"
                      title="Next images"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
              {history.length > 0 ? (
                <div>
                  <div className="relative overflow-hidden">
                    <div className="flex gap-3">
                      {history.map((imageUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setFullscreenImage(imageUrl)
                            setCarouselIndex(idx)
                          }}
                          className={`relative flex-shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer w-32 h-32 hover:opacity-80 ${
                            carouselIndex === idx
                              ? "border-ring scale-105"
                              : "border-foreground/10 hover:border-primary/30"
                          }`}
                          style={{
                            transform: `translateX(calc(-${carouselIndex * 140}px))`,
                            transition: "transform 0.3s ease-in-out",
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`History ${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    {history.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          carouselIndex === idx ? "bg-ring" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No images yet. Generate one to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Image Detail Panel - Right Slide */}
      {fullscreenImage && (
        <>
          <div 
            className="fixed inset-0 bg-background/50 z-40 transition-opacity duration-300" 
            onClick={() => setFullscreenImage(null)}
          />
          <div 
            className={`fixed right-0 top-0 h-screen w-full md:w-[600px] bg-background border-l border-foreground/10 flex flex-col z-50 transition-transform duration-300 ease-out ${
              fullscreenImage ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold">Image Details</h2>
              <button
                onClick={() => setFullscreenImage(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} className="text-foreground" />
              </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              <img
                src={fullscreenImage}
                alt="Full view"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-foreground/10 flex gap-4 items-center justify-center flex-wrap flex-shrink-0">
              <button
                onClick={() => downloadImage(fullscreenImage)}
                disabled={downloadingImage === fullscreenImage}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={downloadingImage === fullscreenImage ? "Downloading..." : "Download"}
              >
                <Download size={20} className="text-foreground" />
              </button>
              <button
                onClick={() => shareImage(fullscreenImage)}
                disabled={sharingImage === fullscreenImage}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={sharingImage === fullscreenImage ? "Sharing..." : "Share"}
              >
                <Share2 size={20} className="text-foreground" />
              </button>
              <button
                onClick={() => deleteImage(fullscreenImage)}
                disabled={deletingImage === fullscreenImage}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={deletingImage === fullscreenImage ? "Deleting..." : "Delete"}
              >
                <Trash2 size={20} className="text-foreground" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toast.message}
        </div>
      )}
    </main>
  )
}
