"use client"

import { useEffect, useState } from "react"
import { Wand2, Save, Library, Film, ArrowLeft, Download, Share2, Trash2, X, Upload } from "lucide-react"
import { DeepSeekModal } from "@/components/deepseek-modal"
import PixabayPage from "@/components/pixabay-page"
import { supabase } from "@/lib/supabase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [error, setError] = useState("")

  const [resolution, setResolution] = useState("1080p")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [durationType, setDurationType] = useState("8s")
  const [audio, setAudio] = useState(true)
  const [imageBase64, setImageBase64] = useState("")
  const [mimeType, setMimeType] = useState("image/jpeg")

  const [imageUrl, setImageUrl] = useState("")
  const [importLoading, setImportLoading] = useState(false)

  const [isDeepSeekOpen, setIsDeepSeekOpen] = useState(false)
  const [isPixabayOpen, setIsPixabayOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedVideoUrl, setSavedVideoUrl] = useState("")
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [savedVideos, setSavedVideos] = useState<Array<{name: string, url: string}>>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const videosPerPage = 3

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  const handleImageUrlImport = async () => {
    if (!imageUrl) return

    try {
      setImportLoading(true)

      const res = await fetch("https://zoop-a1-v2.onrender.com/image/import-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: imageUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Failed to import image")
      }

      setImageBase64(data.image_base64)
      setMimeType(data.mime_type)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setImportLoading(false)
    }
  }

  const fetchUserVideos = async () => {
    if (!userId) return

    try {
      setLoadingVideos(true)
      const { data, error } = await supabase.storage
        .from("videos")
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        })

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        const videoFiles = data.filter(file => !file.name.startsWith('.'))
        const videosWithUrls = videoFiles.map(file => ({
          name: file.name,
          url: supabase.storage.from("videos").getPublicUrl(`${userId}/${file.name}`).data.publicUrl
        }))
        setSavedVideos(videosWithUrls)
        
        // Set the first video as selected if available
        if (videosWithUrls.length > 0) {
          setSelectedVideoUrl(videosWithUrls[0].url)
        }
      } else {
        setSavedVideos([])
        setSelectedVideoUrl(null)
      }
    } catch (err: any) {
      console.error("Error fetching videos:", err)
      setError(err.message)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleUploadVideo = async () => {
    // Upload the generated video
    if (!videoUrl) return

    try {
      setUploading(true)

      // Fetch the generated video
      const response = await fetch(videoUrl)

      if (!response.ok) {
        throw new Error("Failed to fetch video")
      }

      // Convert to blob
      const blob = await response.blob()

      // Unique filename with user ID
      const fileName = `${userId}/video_${Date.now()}.mp4`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("videos")
        .upload(fileName, blob, {
          contentType: "video/mp4",
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName)

      setSavedVideoUrl(data.publicUrl)
      alert("Video uploaded successfully!")
      
      // Refresh the videos list
      await fetchUserVideos()

    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleOpenLibrary = async () => {
    setCurrentPage(0)
    setShowVideoModal(true)
    await fetchUserVideos()
  }

  // Auto-slide carousel
  useEffect(() => {
    if (!showVideoModal || savedVideos.length === 0) return

    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        const totalPages = Math.ceil(savedVideos.length / videosPerPage)
        return prev >= totalPages - 1 ? 0 : prev + 1
      })
    }, 4000) // Auto slide every 4 seconds

    return () => clearInterval(interval)
  }, [showVideoModal, savedVideos.length, videosPerPage])

  const handleDownloadVideo = async () => {
    const urlToDownload = selectedVideoUrl || savedVideoUrl
    if (!urlToDownload) return

    try {
      const response = await fetch(urlToDownload)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zoop_video_${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error(err)
      setError("Failed to download video")
    }
  }

  const handleShareVideo = async () => {
    const urlToShare = selectedVideoUrl || savedVideoUrl
    if (!urlToShare) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Vivafy AI Avatar Video',
          text: 'Check out this amazing AI-generated video!',
          url: urlToShare,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(urlToShare)
        alert("Video link copied to clipboard!")
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleDeleteVideo = async () => {
    const urlToDelete = selectedVideoUrl || savedVideoUrl
    if (!urlToDelete || !userId) return

    try {
      const videoName = savedVideos.find(v => v.url === urlToDelete)?.name
      if (!videoName) return

      const { error } = await supabase.storage
        .from("videos")
        .remove([`${userId}/${videoName}`])

      if (error) {
        throw error
      }

      // Remove from saved videos list
      setSavedVideos(savedVideos.filter(v => v.url !== urlToDelete))
      
      if (selectedVideoUrl === urlToDelete) {
        setSelectedVideoUrl(null)
      }
      
      alert("Video deleted successfully!")
      
      // Refresh the videos list
      await fetchUserVideos()
    } catch (err: any) {
      console.error(err)
      setError("Failed to delete video")
    }
  }

  const calculateVideoCredits = (duration: string) => {
    if (duration === "8s") return 20
    if (duration === "30s") return 60
    if (duration === "56s") return 140
    return 20
  }

  const handleGenerate = async () => {
  if (!prompt) return

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    setError("You must be logged in")
    return
  }

  const requiredCredits = calculateVideoCredits(durationType)

  // Check credits
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profileData) {
    setError("Failed to check credits")
    return
  }

  if (profileData.credits < requiredCredits) {
    setError(`Insufficient credits. You need ${requiredCredits} credits to generate a ${durationType} video.`)
    return
  }

  setLoading(true)
  setError("")
  setVideoUrl("")

  try {
    const res = await fetch(
      "https://zoop-a1-v2.onrender.com/img-video/generate-video",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          audio,
          resolution,
          aspect_ratio: aspectRatio,
          duration_type: durationType,
          image_base64: imageBase64,
          mime_type: mimeType,
        }),
      }
    )

    const text = await res.text()

    console.log("RAW RESPONSE:", text)

    let data

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error("Invalid JSON response from backend")
    }

    if (!res.ok) {
      throw new Error(data.detail || "Generation failed")
    }

    console.log("DOWNLOAD URL:", data.download_url)

    // Deduct credits
    await supabase
      .from('profiles')
      .update({ credits: profileData.credits - requiredCredits })
      .eq('id', userData.user.id)

    setVideoUrl(data.download_url)

  } catch (err: any) {
    console.error(err)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col px-6 py-8">
      <DeepSeekModal isOpen={isDeepSeekOpen} onClose={() => setIsDeepSeekOpen(false)} />
      <PixabayPage isOpen={isPixabayOpen} onClose={() => setIsPixabayOpen(false)} />
      
      {/* Video Save Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-background/50 z-50">
          <div className="absolute right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-background border-l border-primary shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary">
              <h2 className="text-foreground text-2xl font-bold">Your Saved Videos</h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-foreground hover:text-primary-400 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingVideos ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading your videos...</p>
                </div>
              ) : savedVideos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved videos yet</p>
                </div>
              ) : (
                <>
                  {/* Horizontal Carousel */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-foreground font-semibold">All Videos</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="w-8 h-8 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 disabled:bg-gray-700 disabled:cursor-not-allowed text-foreground rounded-full flex items-center justify-center transition"
                        >
                          &lt;
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(Math.ceil(savedVideos.length / videosPerPage) - 1, currentPage + 1))}
                          disabled={currentPage >= Math.ceil(savedVideos.length / videosPerPage) - 1}
                          className="w-8 h-8 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 disabled:bg-gray-700 disabled:cursor-not-allowed text-foreground rounded-full flex items-center justify-center transition"
                        >
                          &gt;
                        </button>
                      </div>
                    </div>
                    
                    {/* Video Carousel */}
                    <div className="flex gap-4 pb-4 justify-center flex-wrap">
                      {savedVideos.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage).map((video) => (
                        <button
                          key={video.name}
                          onClick={() => setSelectedVideoUrl(video.url)}
                          className={`relative rounded-lg overflow-hidden border-2 transition transform hover:scale-105 flex-shrink-0 w-40 h-32 ${
                            selectedVideoUrl === video.url
                              ? "border-primary"
                              : "border-border/70 hover:border-border/70"
                          }`}
                        >
                          <video
                            src={video.url}
                            className="w-full h-full object-cover bg-background"
                          />
                          <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <Film size={24} className="text-primary-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Dot Pagination */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {Array.from({ length: Math.ceil(savedVideos.length / videosPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={`w-2 h-2 rounded-full transition ${
                            currentPage === index ? "bg-primary" : "bg-muted hover:bg-primary/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Selected Video Preview */}
                  {selectedVideoUrl && (
                    <div className="border-t border-primary pt-6">
                      <h3 className="text-foreground font-semibold mb-4">Preview</h3>

                      <video
                        src={selectedVideoUrl}
                        controls
                        className="w-full rounded-lg bg-background border border-primary mb-6"
                      />

                      {/* Action Buttons - Circular */}
                      <div className="flex gap-6 items-center justify-center">
                        {/* Download Button */}
                        <button
                          onClick={handleDownloadVideo}
                          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/85 transition hover:scale-110 transform duration-200"
                          title="Download"
                        >
                          <Download size={24} />
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={handleShareVideo}
                          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/85 transition hover:scale-110 transform duration-200"
                          title="Share"
                        >
                          <Share2 size={24} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={handleDeleteVideo}
                          className="w-16 h-16 rounded-full bg-red-500 text-foreground flex items-center justify-center hover:bg-red-600 transition hover:scale-110 transform duration-200"
                          title="Delete"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Header with Back Button */}
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

      {/* Center Title */}
     <div className="flex flex-col items-center justify-center mb-24 text-center">
  <h1 className="text-5xl font-bold tracking-tight">
    Generate AI Avatars with Vivafy AI
  </h1>

  <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
    Create expressive avatar videos from a simple idea with natural motion,
    engaging delivery, and studio-quality visuals powered by Vivafy AI.
  </p>
</div>

      {/* Main Layout */}
      <div className="flex gap-10 flex-1 items-start">
        
        {/* Left Panel - Input Section */}
        <div className="flex-1 max-w-md space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Set up</h2>
          </div>

          {/* Prompt Textarea with Icons */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Prompt</label>
              <span className="text-xs text-muted-foreground">
                {prompt.length} characters
              </span>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the avatar, voice, scene, and message for your video..."
                className="w-full h-40 p-4 pr-12 bg-card border border-border/70 rounded-xl text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary transition"
              />

              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  title="Magic"
                  onClick={() => setIsDeepSeekOpen(true)}
                  className="p-1 hover:bg-primary rounded transition text-muted-foreground hover:text-foreground"
                >
                  <Wand2 size={16} />
                </button>

                <button
                  title="Library"
                  onClick={handleOpenLibrary}
                  className="p-1 hover:bg-primary rounded transition text-muted-foreground hover:text-foreground"
                >
                  <Save size={16} />
                </button>

                <button
                  title="Library"
                  onClick={() => setIsPixabayOpen(true)}
                  className="p-1 hover:bg-primary rounded transition text-muted-foreground hover:text-foreground"
                >
                  <Library size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Image
            </label>

            {imageBase64 ? (
              <div className="space-y-3">
                <div className="relative w-32">
                  <div className="w-32 rounded-xl border border-border/70 overflow-hidden bg-background">
                    <img
                      src={`data:${mimeType};base64,${imageBase64}`}
                      alt="Preview"
                      className="w-32 h-32 object-contain"
                    />
                  </div>

                  <button
                    onClick={() => setImageBase64("")}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition"
                  >
                    ×
                  </button>
                </div>

                <label className="block px-4 py-2 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 border border-primary rounded-xl cursor-pointer transition text-center text-sm text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      setMimeType(file.type)

                      const reader = new FileReader()

                      reader.onloadend = () => {
                        const result = reader.result as string
                        const base64 = result.split(",")[1]
                        setImageBase64(base64)
                      }

                      reader.readAsDataURL(file)
                    }}
                    className="hidden"
                  />

                  Change Image
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-border/70 rounded-xl cursor-pointer hover:border-primary/70 hover:bg-secondary transition transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]

                    if (!file) return

                    setMimeType(file.type)

                    const reader = new FileReader()

                    reader.onloadend = () => {
                      const result = reader.result as string
                      const base64 = result.split(",")[1]
                      setImageBase64(base64)
                    }

                    reader.readAsDataURL(file)
                  }}
                  className="hidden"
                />

                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Click to upload or drag and drop
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Import Image From URL */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Import Image URL
            </label>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-background border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />

              <button
                onClick={handleImageUrlImport}
                disabled={importLoading}
                className="px-5 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 rounded-xl text-sm font-medium text-primary-foreground transition"
              >
                {importLoading ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>

        {/* Center Video Preview */}
        <div className="flex-1 flex items-start justify-center pt-24 min-h-[700px]">
          {videoUrl ? (
            <div className="w-full max-w-2xl space-y-4">
              {/* Button Container */}
              <div className="flex gap-4">
                {/* Download Button */}
                <a
                  href={videoUrl}
                  download
                  className="flex-1 px-6 py-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 text-primary-foreground font-semibold rounded-xl text-center transition"
                >
                  Download
                </a>

                {/* Upload Button */}
                <button
                  onClick={handleUploadVideo}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 disabled:bg-primary/60 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  {uploading ? "Saving..." : "Upload"}
                </button>
              </div>

              {/* Video Preview */}
              <video
                src={videoUrl}
                controls
                className="w-full rounded-2xl border border-border/70 shadow-2xl"
              />

              {/* History */}
              <div className="mt-6 pt-6 border-t border-border/70">
                <h3 className="text-lg font-semibold mb-4">History</h3>

                <p className="text-muted-foreground text-sm">
                  Your generated videos will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-5 flex size-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b2de233,#17d5da33)] text-[#8b2de2] ring-8 ring-[#17d5da1a]">
                <Film size={44} strokeWidth={1.7} />
              </div>

              <h2 className="text-2xl font-bold mb-2">
                Your avatar video awaits here
              </h2>

              <p className="text-muted-foreground text-sm mt-2">
                Generate an avatar video to bring your story to life
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Settings Section */}
        <div className="flex-1 max-w-md space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Resolution
              </label>

              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="w-full bg-background border-border/70 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/70">
                  <SelectItem value="720p">720P</SelectItem>
                  <SelectItem value="1080p">1080P</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Aspect Ratio
              </label>

              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="w-full bg-background border-border/70 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/70">
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Duration
              </label>

              <Select value={durationType} onValueChange={setDurationType}>
                <SelectTrigger className="w-full bg-background border-border/70 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/70">
                  <SelectItem value="8s">Quick (8s)</SelectItem>
                  <SelectItem value="30s">Pro (30s)</SelectItem>
                  <SelectItem value="56s">Premium (56s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Audio</label>

              <button
                onClick={() => setAudio(!audio)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  audio ? "bg-primary" : "bg-[#1f2937]"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transform transition ${
                    audio ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full px-6 py-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 disabled:bg-primary/60 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl transition duration-200"
          >
            {loading ? "Generating..." : "Generate Video (20 credits)"}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
