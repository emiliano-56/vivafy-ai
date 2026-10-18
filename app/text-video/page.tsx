"use client"

import { useEffect, useState } from "react"
import { VivafyHeader, primaryButton, inputClass } from "@/components/vivafy-header"
import { ArrowLeft, Download, Share2, Trash2, X, Upload, Film, ChevronLeft, ChevronRight, Wand2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DeepSeekModal } from "@/components/deepseek-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function TextVideoPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [error, setError] = useState("")

  const [resolution, setResolution] = useState("1080p")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [durationType, setDurationType] = useState("8s")
  const [audio, setAudio] = useState(true)

  const [cameraMovement, setCameraMovement] = useState("static shot")
  const [motion, setMotion] = useState("natural motion")
  const [style, setStyle] = useState("cinematic")
  
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [savedVideos, setSavedVideos] = useState<Array<{name: string, url: string}>>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [carouselPosition, setCarouselPosition] = useState(0)
  const [isDeepSeekOpen, setIsDeepSeekOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Fetch videos using the user ID directly
        await fetchUserVideosWithId(user.id)
      }
    }
    fetchUser()
  }, [])

  // Auto-slide carousel
  useEffect(() => {
    if (savedVideos.length === 0) return

    const interval = setInterval(() => {
      setCarouselPosition((prev) => {
        const maxPosition = Math.max(0, savedVideos.length - 3)
        return prev >= maxPosition ? 0 : prev + 1
      })
    }, 4000) // Auto-slide every 4 seconds

    return () => clearInterval(interval)
  }, [savedVideos.length])

  const fetchUserVideosWithId = async (currentUserId: string) => {
    try {
      setLoadingVideos(true)
      console.log("[v0] Fetching videos for user:", currentUserId)
      
      const { data, error } = await supabase.storage
        .from("videos")
        .list(currentUserId, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        })

      console.log("[v0] Supabase response:", { data, error })

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        const videoFiles = data.filter(file => !file.name.startsWith('.'))
        console.log("[v0] Video files found:", videoFiles)
        
        const videosWithUrls = videoFiles.map(file => ({
          name: file.name,
          url: supabase.storage.from("videos").getPublicUrl(`${currentUserId}/${file.name}`).data.publicUrl
        }))
        
        console.log("[v0] Videos with URLs:", videosWithUrls)
        setSavedVideos(videosWithUrls)
        
        // Set the first video as selected if available
        if (videosWithUrls.length > 0) {
          setSelectedVideoUrl(videosWithUrls[0].url)
        }
      } else {
        console.log("[v0] No videos found")
        setSavedVideos([])
        setSelectedVideoUrl(null)
      }
    } catch (err: any) {
      console.error("[v0] Error fetching videos:", err)
      setError(err.message)
    } finally {
      setLoadingVideos(false)
    }
  }

  const fetchUserVideos = async () => {
    if (!userId) return
    await fetchUserVideosWithId(userId)
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



  const handleDownloadVideo = async () => {
    const urlToDownload = selectedVideoUrl
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
    const urlToShare = selectedVideoUrl
    if (!urlToShare) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Zoop Video',
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
    const urlToDelete = selectedVideoUrl
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
      
      // If the deleted video was selected, select the next one
      if (selectedVideoUrl === urlToDelete) {
        const remaining = savedVideos.filter(v => v.url !== urlToDelete)
        setSelectedVideoUrl(remaining.length > 0 ? remaining[0].url : null)
      }

      alert("Video deleted successfully!")
      await fetchUserVideos()
    } catch (err: any) {
      console.error(err)
      setError("Failed to delete video")
    }
  }

  const buildPrompt = () => {
    return `
${prompt}
`
  }

  // 🔥 helper to update or insert line
  const updatePromptLine = (label: string, value: string) => {
    setPrompt((prev) => {
      const regex = new RegExp(`${label}:.*`, "i")

      if (regex.test(prev)) {
        return prev.replace(regex, `${label}: ${value}`)
      } else {
        return `${label}: ${value}\n${prev}`
      }
    })
  }

  const calculateVideoCredits = (duration: string) => {
    if (duration === "8s") return 20
    if (duration === "30s") return 60
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
      const res = await fetch("https://zoop-a1-v2.onrender.com/text-video/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: buildPrompt(),
          audio,
          resolution,
          aspect_ratio: aspectRatio,
          duration_type: durationType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Generation failed")
      }

      // Deduct credits
      await supabase
        .from('profiles')
        .update({ credits: profileData.credits - requiredCredits })
        .eq('id', userData.user.id)

      setVideoUrl(data.download_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-foreground px-6 py-10" style={{ "--primary": "#5b5a98", "--primary-foreground": "#ffffff", "--secondary": "#f1f1fb", "--secondary-foreground": "#5b5a98", "--muted": "#f7f7fc", "--muted-foreground": "#9897ad", "--accent": "#f26b43" } as React.CSSProperties}>
<VivafyHeader />
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">AI Video Creator</h1>
        <p className="text-muted-foreground text-sm">Transform your ideas into stunning videos instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT SIDE */}
        <div className="flex flex-col h-full">

          {/* PROMPT */}
          <div className="relative flex-shrink-0">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video..."
              className="w-full h-32 p-4 pr-14 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition flex-shrink-0 resize-none"
            />
            <button
              onClick={() => setIsDeepSeekOpen(true)}
              className="absolute bottom-4 right-4 w-10 h-10 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white flex items-center justify-center rounded-lg transition hover:scale-110 transform duration-200"
              title="AI Magic - Deepseek Modal"
            >
              <Wand2 size={20} />
            </button>
          </div>

          {/* SETTINGS */}
          <div className="mt-6 flex-1 overflow-y-auto min-h-0">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Settings</h2>

            <div className="grid grid-cols-2 gap-4">

              {/* STYLE */}
              <div>
                <label className="text-sm text-muted-foreground">Style</label>
                <Select value={style} onValueChange={(value) => {
                  setStyle(value)
                  updatePromptLine("Style", value)
                }}>
                  <SelectTrigger className="w-full mt-1 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary text-secondary-foreground border-primary/20 hover:border-[#f26b43]">
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="3d animation">3D Animation</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CAMERA */}
              <div>
                <label className="text-sm text-muted-foreground">Camera</label>
                <Select value={cameraMovement} onValueChange={(value) => {
                  setCameraMovement(value)
                  updatePromptLine("Camera movement", value)
                }}>
                  <SelectTrigger className="w-full mt-1 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary text-secondary-foreground border-primary/20 hover:border-[#f26b43]">
                    <SelectItem value="static shot">Static Shot</SelectItem>
                    <SelectItem value="slow zoom in">Slow Zoom In</SelectItem>
                    <SelectItem value="slow zoom out">Slow Zoom Out</SelectItem>
                    <SelectItem value="drone shot">Drone Shot</SelectItem>
                    <SelectItem value="handheld camera">Handheld Camera</SelectItem>
                    <SelectItem value="tracking shot">Tracking Shot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* MOTION */}
              <div>
                <label className="text-sm text-muted-foreground">Motion</label>
                <Select value={motion} onValueChange={(value) => {
                  setMotion(value)
                  updatePromptLine("Motion", value)
                }}>
                  <SelectTrigger className="w-full mt-1 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary text-secondary-foreground border-primary/20 hover:border-[#f26b43]">
                    <SelectItem value="natural motion">Natural Motion</SelectItem>
                    <SelectItem value="slow motion">Slow Motion</SelectItem>
                    <SelectItem value="fast motion">Fast Motion</SelectItem>
                    <SelectItem value="dramatic motion">Dramatic Motion</SelectItem>
                    <SelectItem value="smooth motion">Smooth Motion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* RESOLUTION */}
              <div>
                <label className="text-sm text-muted-foreground">Resolution</label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="w-full mt-1 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary text-secondary-foreground border-primary/20 hover:border-[#f26b43]">
                    <SelectItem value="720p">720P</SelectItem>
                    <SelectItem value="1080p">1080P</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ASPECT */}
              <div>
                <label className="text-sm text-muted-foreground">Aspect</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="w-full mt-1 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary text-secondary-foreground border-primary/20 hover:border-[#f26b43]">
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="9:16">9:16</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DURATION */}
              <div>
                <label className="text-sm text-muted-foreground">Duration</label>
                <Select value={durationType} onValueChange={setDurationType}>
                  <SelectTrigger className="w-full mt-1 bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:border-primary transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary text-secondary-foreground border-primary/20 hover:border-[#f26b43]">
                    <SelectItem value="8s">8s</SelectItem>
                    <SelectItem value="30s">30s</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          {/* AUDIO */}
          <div className="flex items-center gap-3 mt-6 flex-shrink-0">
            <span className="text-foreground">Audio</span>
            <button
              onClick={() => setAudio(!audio)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                audio ? "bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white" : "bg-gray-600"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full transform transition ${
                  audio ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* GENERATE */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="mt-6 w-full py-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white transition rounded-xl font-medium flex-shrink-0"
          >
            {loading ? "Generating..." : "Generate Video"}
          </button>

          {error && <p className="text-red-400 mt-4 flex-shrink-0">{error}</p>}
        </div>

        {/* RIGHT SIDE */}
        <div>

          <div className="bg-white border-primary/20 rounded-2xl p-4 min-h-[300px] flex flex-col shadow-sm">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-foreground">Preview</h2>

              {videoUrl && (
                <div className="flex gap-2">
                  <a
                    href={videoUrl}
                    download
                    className="px-4 py-2 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white rounded-lg text-sm transition"
                  >
                    Download
                  </a>
                  <button
                    onClick={handleUploadVideo}
                    disabled={uploading}
                    className="px-4 py-2 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white disabled:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/40 disabled:opacity-50 rounded-lg text-sm transition"
                  >
                    {uploading ? "Saving..." : "Upload"}
                  </button>
                </div>
              )}
            </div>

            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full rounded-xl border border-primary/20"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No video generated yet
              </div>
            )}
          </div>

          {/* HISTORY - CAROUSEL */}
          <div className="mt-6 bg-white border-primary/20 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground">History</h2>
              {savedVideos.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCarouselPosition(Math.max(0, carouselPosition - 1))}
                    disabled={carouselPosition === 0}
                    className="w-8 h-8 flex items-center justify-center bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white disabled:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/40 disabled:cursor-not-allowed text-white rounded-lg transition"
                    title="Previous"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCarouselPosition(Math.min(Math.max(0, savedVideos.length - 3), carouselPosition + 1))}
                    disabled={carouselPosition >= Math.max(0, savedVideos.length - 3)}
                    className="w-8 h-8 flex items-center justify-center bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white disabled:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/40 disabled:cursor-not-allowed text-white rounded-lg transition"
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
            
            {loadingVideos ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your videos...</p>
              </div>
            ) : savedVideos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Previous generations will appear here
              </p>
            ) : (
              <>
                {/* Video Carousel */}
                <div className="flex gap-3 pb-4 overflow-hidden mb-4">
                  {savedVideos.slice(carouselPosition, carouselPosition + 3).map((video, index) => (
                    <button
                      key={`${video.name}-${index}`}
                      onClick={() => setSelectedVideoUrl(video.url)}
                      className={`relative rounded-lg overflow-hidden border-2 transition transform hover:scale-105 flex-shrink-0 w-32 h-24 ${
                        selectedVideoUrl === video.url
                          ? "border-primary"
                          : "border-primary/20 hover:border-[#f26b43] hover:border-[#f26b43]"
                      }`}
                    >
                      <video
                        src={video.url}
                        className="w-full h-full object-cover bg-white"
                      />
                      <div className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <Film size={20} className="text-primary" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Dot Pagination */}
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: Math.ceil(savedVideos.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselPosition(index * 3)}
                      className={`w-2 h-2 rounded-full transition ${
                        Math.floor(carouselPosition / 3) === index ? "bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white" : "bg-gray-600 hover:bg-gray-500"
                      }`}
                      title={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Selected Video Preview */}
                {selectedVideoUrl && (
                  <div className="border-t border-primary/20 hover:border-[#f26b43] mt-4 pt-4">
                    <video
                      src={selectedVideoUrl}
                      controls
                      className="w-full rounded-lg bg-white border border-primary/20 hover:border-[#f26b43] mb-3 max-h-48"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 items-center justify-center">
                      <button
                        onClick={handleDownloadVideo}
                        className="w-10 h-10 rounded-full bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white text-white flex items-center justify-center hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white transition hover:scale-110 transform duration-200"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>

                      <button
                        onClick={handleShareVideo}
                        className="w-10 h-10 rounded-full bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white text-white flex items-center justify-center hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/85 text-white transition hover:scale-110 transform duration-200"
                        title="Share"
                      >
                        <Share2 size={18} />
                      </button>

                      <button
                        onClick={handleDeleteVideo}
                        className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition hover:scale-110 transform duration-200"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      {/* DEEPSEEK MODAL */}
      <DeepSeekModal isOpen={isDeepSeekOpen} onClose={() => setIsDeepSeekOpen(false)} />
    </div>
  )
}
