"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Loader2,
  Save,
  Play,
  Pause,
  Film,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const router = useRouter();
  const [storyIdea, setStoryIdea] = useState("");
  const [sceneCount, setSceneCount] = useState(4);
  const [characterCount, setCharacterCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [audience, setAudience] = useState("general");

  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [generatingAllImages, setGeneratingAllImages] = useState(false);
  const [loadingSceneImage, setLoadingSceneImage] = useState<number | null>(null);
  const [additionalNarrations, setAdditionalNarrations] = useState<{
    [sceneIndex: number]: string[];
  }>({});
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);
  const [jobId, setJobId] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [processingMovie, setProcessingMovie] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const wavesurferRef = useRef<{ [key: number]: WaveSurfer }>({});
  const musicContainerRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [musicPlaying, setMusicPlaying] = useState<{ [key: number]: boolean }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedVideos, setSavedVideos] = useState<
    Array<{ name: string; url: string }>
  >([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] =
    useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 3;

  // =====================================================
  // GET USER ID
  // =====================================================
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  const [projectTitle, setProjectTitle] = useState("");
  const [story, setStory] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [musicFiles, setMusicFiles] = useState<string[]>([]);

  // =========================
  // STEP STATE MACHINE
  // =========================
  const [step, setStep] = useState<
    "idle" | "story" | "images" | "rendering" | "done"
  >("idle");

  useEffect(() => {
    fetch(
      "https://zoop-a1-v2.onrender.com/movie-generator/bg-music"
    )
      .then((r) => r.json())
      .then((data) => {
        setMusicFiles(data.files || []);
      });
  }, []);

  // =====================================================
  // GENERATE STORY
  // =====================================================
  const handleGenerateStory = async () => {
    if (!storyIdea.trim()) return;

    setLoading(true);
    setStory(null);
    setVideoUrl("");
    setStep("idle");

    try {
      const res = await fetch(
        "https://zoop-a1-v2.onrender.com/movie-generator/generate-movie",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story_idea: storyIdea,
            scene_count: sceneCount,
            character_count: characterCount,
            aspect_ratio: aspectRatio,
            audience,
          }),
        }
      );

      const data = await res.json();

      const storyWithAnimation = {
        ...data.story,
        scenes: data.story.scenes.map((s: any) => ({
          ...s,
          animation: s.animation || "none",
        })),
      };

      setStory(storyWithAnimation);
      setStep("story");
    } catch (err) {
      console.error(err);
      alert("Failed to generate story");
    }

    setLoading(false);
  };

  // =====================================================
  // HELPER: LOAD MUSIC
  // =====================================================
  const loadMusic = (sceneIndex: number, filename: string) => {
    const ws = wavesurferRef.current[sceneIndex];

    if (!ws) return;

    ws.stop();

    ws.load(
      `https://zoop-a1-v2.onrender.com/movie-generator/bg-music/${filename}`
    );

    setMusicPlaying((prev) => ({
      ...prev,
      [sceneIndex]: false,
    }));
  };

  // =====================================================
  // UPDATE FUNCTIONS
  // =====================================================
  const updateCharacter = (i: number, field: string, value: string) => {
    const updated = { ...story };
    updated.characters[i][field] = value;
    setStory(updated);
  };

  const updateScene = (i: number, field: string, value: any) => {
    const updated = { ...story };

    updated.scenes[i][field] = value;

    updated.scenes[i].voice =
      updated.scenes[i].voice || "en-US-AriaNeural";

    // ensure animation always exists
    updated.scenes[i].animation =
      updated.scenes[i].animation || "none";

    setStory(updated);
  };

  // Narrator management
  const addNarration = (sceneIndex: number) => {
    setAdditionalNarrations({
      ...additionalNarrations,
      [sceneIndex]: [
        ...(additionalNarrations[sceneIndex] || []),
        "",
      ],
    });
  };

  const updateNarration = (
    sceneIndex: number,
    narrationIndex: number,
    value: string
  ) => {
    if (value.length > 200) return;
    const updated = [...(additionalNarrations[sceneIndex] || [])];
    updated[narrationIndex] = value;
    setAdditionalNarrations({
      ...additionalNarrations,
      [sceneIndex]: updated,
    });
  };

  const deleteNarration = (sceneIndex: number, narrationIndex: number) => {
    const updated = (additionalNarrations[sceneIndex] || []).filter(
      (_, i) => i !== narrationIndex
    );
    setAdditionalNarrations({
      ...additionalNarrations,
      [sceneIndex]: updated,
    });
  };

  const moveNarration = (
    sceneIndex: number,
    narrationIndex: number,
    direction: "up" | "down"
  ) => {
    const updated = [...(additionalNarrations[sceneIndex] || [])];
    if (direction === "up" && narrationIndex > 0) {
      [updated[narrationIndex - 1], updated[narrationIndex]] = [
        updated[narrationIndex],
        updated[narrationIndex - 1],
      ];
    } else if (
      direction === "down" &&
      narrationIndex < updated.length - 1
    ) {
      [updated[narrationIndex], updated[narrationIndex + 1]] = [
        updated[narrationIndex + 1],
        updated[narrationIndex],
      ];
    }
    setAdditionalNarrations({
      ...additionalNarrations,
      [sceneIndex]: updated,
    });
  };

  // =====================================================
  // RENDER FINAL MOVIE (UNCHANGED)
  // =====================================================
  // =====================================================
// RENDER FINAL MOVIE
// =====================================================
const handleRenderMovie = async () => {

  setProcessingMovie(true);

  try {

    const payload = {
      items: story.scenes.map((s: any) => ({
        image_url: s.image_url,
        narration: s.narration,
        voice: s.voice || "en-US-AriaNeural",
        bg_music: s.bg_music || "lofi.mp3",
        music_volume:
          s.music_volume !== undefined
            ? Number(s.music_volume)
            : 0.2,
        text_color:
          s.text_color || "#ffffff",
        animation: s.animation || "none",
      })),
    };

    const res = await fetch(
      "https://zoop-a1-v2.onrender.com/movie-generator/start-render",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    setJobId(data.job_id);

    setJobStatus("queued");

    pollJobStatus(data.job_id);

  } catch (err) {

    console.error(err);

    alert("Movie generation failed");

    setProcessingMovie(false);

  }
};

  // =====================================================
  // GENERATE ALL IMAGES
  // =====================================================
  const handleGenerateAllImages = async () => {
    if (!userId) {
      alert("You must be logged in");
      return;
    }

    const totalCreditsNeeded = story.scenes.length * 10;

    // Check credits
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      alert("Failed to check credits");
      return;
    }

    if (profileData.credits < totalCreditsNeeded) {
      alert(`Insufficient credits. You need ${totalCreditsNeeded} credits to generate ${story.scenes.length} character(s). You have ${profileData.credits} credits.`);
      return;
    }

    setGeneratingAllImages(true);

    try {
      for (let i = 0; i < story.scenes.length; i++) {
        await generateSceneImage(i);
      }

      // Deduct credits after all images are generated successfully
      await supabase
        .from('profiles')
        .update({ credits: profileData.credits - totalCreditsNeeded })
        .eq('id', userId);

      setStep("images");
    } catch (err) {
      alert("Failed to generate all images");
    }

    setGeneratingAllImages(false);
  };



  // =====================================================
  // NEW: GENERATE IMAGE PER SCENE (nano)
  // =====================================================
  const generateSceneImage = async (i: number) => {
    setLoadingSceneImage(i);
    try {
      const prompt = story.scenes[i].image_prompt;

      const res = await fetch("https://zoop-a1-v2.onrender.com/nano/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await res.json();

      const updated = { ...story };
      updated.scenes[i].image_url = data.image_url;
      setStory(updated);
      setStep("images");
    } catch (err) {
      alert("Image generation failed");
    } finally {
      setLoadingSceneImage(null);
    }
  };

  // =====================================================
  // PREVIEW VOICE
  // =====================================================
  const previewVoice = async (
    narration: string,
    voice: string,
    sceneIndex: number
  ) => {
    try {
      setPreviewLoading(sceneIndex);

      // Stop any currently playing preview
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setPlayingScene(null);
      }

      const res = await fetch(
        "https://zoop-a1-v2.onrender.com/movie-generator/preview-voice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: narration,
            voice: voice,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Preview failed");
      }

      const blob = await res.blob();

      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);

      setCurrentAudio(audio);
      setPlayingScene(sceneIndex);

      audio.onended = () => {
        setPlayingScene(null);
      };

      await audio.play();

    } catch (err) {
      console.error(err);
      alert("Voice preview failed");
    } finally {
      setPreviewLoading(null);
    }
  };

  const stopPreview = () => {
    if (!currentAudio) return;

    currentAudio.pause();
    currentAudio.currentTime = 0;

    setPlayingScene(null);
  };

  // =====================================================
  // UPLOAD VIDEO TO SUPABASE
  // =====================================================
  const handleUploadVideo = async () => {
    if (!videoUrl) return;

    try {
      setUploading(true);

      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }

      const blob = await response.blob();

      const fileName =
        `${userId}/video_${Date.now()}.mp4`;

      const { error } = await supabase.storage
        .from("videos")
        .upload(fileName, blob, {
          contentType: "video/mp4",
        });

      if (error) {
        throw error;
      }

      alert("Video uploaded successfully");

      await fetchUserVideos();

    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // FETCH USER VIDEOS FROM SUPABASE
  // =====================================================
  const fetchUserVideos = async () => {
    if (!userId) return;

    try {
      setLoadingVideos(true);

      const { data, error } =
        await supabase.storage
          .from("videos")
          .list(userId, {
            limit: 100,
            offset: 0,
            sortBy: {
              column: "created_at",
              order: "desc",
            },
          });

      if (error) throw error;

      const videosWithUrls =
        data.map((file) => ({
          name: file.name,
          url:
            supabase.storage
              .from("videos")
              .getPublicUrl(
                `${userId}/${file.name}`
              ).data.publicUrl,
        }));

      setSavedVideos(videosWithUrls);

      if (videosWithUrls.length > 0) {
        setSelectedVideoUrl(
          videosWithUrls[0].url
        );
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // =====================================================
  // OPEN VIDEO LIBRARY MODAL
  // =====================================================
  const handleOpenLibrary = async () => {
    setCurrentPage(0);
    setShowVideoModal(true);
    await fetchUserVideos();
  };

  // =====================================================
  // DOWNLOAD VIDEO
  // =====================================================
  const handleDownloadVideo = async () => {
    if (!videoUrl) return;

    const response = await fetch(videoUrl);

    const blob = await response.blob();

    const url =
      window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    const fileName = projectTitle 
      ? `${projectTitle}.mp4` 
      : "movie.mp4";

    a.download = fileName;

    a.click();

    URL.revokeObjectURL(url);
  };


  // =====================================================
  // POLL JOB STATUS
  // =====================================================
// POLL JOB STATUS
// =====================================================
const pollJobStatus = async (id: string) => {

  const interval = setInterval(async () => {

    try {

      const res = await fetch(
        `https://zoop-a1-v2.onrender.com/movie-generator/status/${id}`
      );

      const data = await res.json();

      console.log("STATUS DATA:", data);

      setJobStatus(data.status);

      if (data.status === "completed") {

        clearInterval(interval);

        // Use video_url returned by backend
        if (data.video_url) {

          setVideoUrl(
            `https://zoop-a1-v2.onrender.com${data.video_url}`
          );

        } else if (data.file) {

          const filename = data.file.split("/").pop();

          setVideoUrl(
            `https://zoop-a1-v2.onrender.com/movie-generator/file/${filename}`
          );
        }

        setProcessingMovie(false);
        setStep("done");
      }

      if (data.status === "failed") {

        clearInterval(interval);

        alert(
          data.error || "Movie generation failed"
        );

        setProcessingMovie(false);
      }

    } catch (err) {

      console.error("Polling Error:", err);

      clearInterval(interval);

      setProcessingMovie(false);

      alert("Failed to check render status");
    }

  }, 3000);
};

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      className="flex h-screen flex-col bg-background text-foreground"
      style={{ "--primary": "#5b5a98" } as React.CSSProperties}
    >
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: color-mix(in srgb, var(--primary) 28%, transparent);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: color-mix(in srgb, var(--primary) 45%, transparent);
        }
      `}      </style>

      <nav className="flex shrink-0 items-center justify-between mb-5 border-b border-foreground/3 bg-card/80 px-5 py-3 backdrop-blur-sm md:px-6">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c499285c-186e-4c66-8181-3b746e8fa908-dBa8u2kHHJuIITpDgbw7d89Pz0WYeZ.png"
          alt="vivafy AI"
          className="h-10 w-auto object-contain"
        />
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Back to home
        </button>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* LEFT PANEL (UNCHANGED) */}
      <aside className="w-full shrink-0 border-b border-foreground/10 bg-card/80 p-5 backdrop-blur-sm md:w-[310px] md:border-b-0 md:border-r md:p-6 lg:w-[340px]"> <div className="grid h-full grid-cols-1 content-start gap-5 overflow-y-auto md:grid-cols-2">

        <div className="col-span-full">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-muted-foreground">
              Story Idea
            </label>
          <button
  onClick={handleOpenLibrary}
  className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
  text-white transition-all duration-200
  active:scale-95"
  title="Video Library"
>
  <Save className="w-4 h-4" />
</button>
          </div>
          <textarea
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            placeholder="Enter a story idea or describe the storyline you want to create..."
            className="w-full h-28 p-2 bg-background border border-foreground/10 rounded-xl resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            What's the  Title?
          </label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g., My First Movie"
            className="w-full p-2 bg-background border border-foreground/10 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Story Idea
          </label>
          <Select value={String(sceneCount)} onValueChange={(v) => setSceneCount(Number(v))}>
            <SelectTrigger className="w-full bg-background border border-foreground/10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Number of Characters
          </label>
          <Select value={String(characterCount)} onValueChange={(v) => setCharacterCount(Number(v))}>
            <SelectTrigger className="w-full bg-background border border-foreground/10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Audience
          </label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="w-full bg-background border border-foreground/10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General (All Ages)</SelectItem>
              <SelectItem value="kids">Kids (3–12)</SelectItem>
              <SelectItem value="teens">Teens (13–17)</SelectItem>
              <SelectItem value="adults">Adults (18+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Choose style
          </label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-full bg-background border border-foreground/10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">YouTube</SelectItem>
              <SelectItem value="9:16">TikTok</SelectItem>
              <SelectItem value="1:1">Instagram</SelectItem>
              <SelectItem value="4:3">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={handleGenerateStory}
          disabled={loading}
          className="col-span-full w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-semibold transition"
        >
          {loading ? "Creating Story..." : "Step 1: Create Story"}
        </button>

        {story && (
          <button
            onClick={handleGenerateAllImages}
            disabled={generatingAllImages}
            className="col-span-full w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-semibold transition"
          >
            {generatingAllImages
              ? "Generating Characters..."
              : `Step 2: Generate All Characters (${story.scenes.length * 10} credits)`}
          </button>
        )}

  {generatingAllImages === false && story && step !== "idle" && step !== "story" && (
  <button
    onClick={handleRenderMovie}
    disabled={processingMovie}
    className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-semibold transition"
  >
    {processingMovie
      ? `Processing (${jobStatus})`
      : "Step 3: Render Full Video"}
  </button>
  )}

  </div></aside>

      {/* CENTER PANEL - TITLE, CHARACTERS, AND FINAL VIDEO */}
      <main className="min-w-0 flex-1 overflow-y-auto bg-background px-5 py-8 md:px-8 lg:px-12"> <div className="mx-auto flex max-w-4xl flex-col gap-8">

        {!story && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-foreground/10 bg-muted/30 px-6 text-center text-muted-foreground shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Film className="size-7" />
            </div>
            <p className="max-w-xs text-sm leading-6">Your generated movie will appear here...</p>
          </div>
        )}

        {story && (
          <>
            {/* TITLE */}
            <h2 className="text-4xl font-black tracking-tight text-white">
  {story.title}
  <span className="text-primary">.</span>
</h2>

            {/* CHARACTERS */}
            <div>
              <div className="border-b border-foreground/10 pb-2 mb-4">
  <h3 className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
    Characters
  </h3>
</div>
              {story.characters.map((c: any, i: number) => (
                <div key={i} className="mb-4 bg-background p-3 rounded-lg border border-foreground/10">

                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateCharacter(i, "name", e.target.value)
                    }
                    className="w-full bg-background p-2 mb-2"
                    placeholder="Character Name"
                  />

                  <textarea
                    value={c.appearance}
                    disabled
                    className="w-full bg-background border border-foreground/10 p-2 resize-none overflow-y-auto rounded-lg"
                    rows={4}
                    placeholder="Character Position/Description"
                  />
                </div>
              ))}
            </div>

            {/* FINAL VIDEO PREVIEW */}
            {videoUrl && (
              <div className="border-t border-foreground/10 pt-6">
                <h3 className="text-lg text-primary mb-3">
                  Final Story
                </h3>

                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded border border-foreground/10"
                />

                <div className="flex gap-4 mt-4">

                  <button
                    onClick={handleDownloadVideo}
                    className="
                    flex-1
                    bg-primary text-primary-foreground
                    hover:bg-primary/90
                    p-3
                    rounded
                    text-sm
                    transition
                    "
                  >
                    Download
                  </button>

                  <button
                    onClick={handleUploadVideo}
                    disabled={uploading}
                    className="
                    flex-1
                    bg-primary text-primary-foreground
                    hover:bg-primary/90
                    p-3
                    rounded
                    text-sm
                    transition
                    disabled:opacity-50
                    "
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload"}
                  </button>

                </div>
              </div>
            )}
          </>
        )}
      </div></main>

      {/* RIGHT PANEL - SCENES WITH PROMPTS AND SMALL PREVIEWS */}
      <aside className="w-full shrink-0 border-t border-foreground/10 bg-muted/40 p-5 md:w-[360px] md:border-l md:border-t-0 md:p-6 lg:w-[390px]"><div className="flex h-full flex-col gap-6 overflow-y-auto">

        {story && (
          <>
            <h3 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
  Scenes
</h3>

            {story.scenes.map((s: any, i: number) => (
              <div
                key={i}
                className="bg-background p-3 rounded space-y-3"
              >

  <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
  Scene {s.scene_number}
</p>

                {/* NARRATOR LABEL */}
                <div>
                 <label className="block text-xs uppercase tracking-[0.15em] text-primary font-bold mb-2">
  Primary Narration
</label>
                  <div className="relative group/narrator">
                    <textarea
                      value={s.narration || ""}
                      onChange={(e) =>
                        updateScene(i, "narration", e.target.value)
                      }
                      className="w-full bg-background border border-foreground/10 p-2 resize-none text-xs rounded"
                      rows={4}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {(s.narration || "").length}/200
                    </div>
                  </div>
                </div>

                {/* ADDITIONAL NARRATIONS */}
                {additionalNarrations[i] &&
                  additionalNarrations[i].length > 0 && (
                    <div className="space-y-2">
                      {additionalNarrations[i].map(
                        (narration: string, nIdx: number) => (
                          <div
                            key={nIdx}
                            className="relative group/additional-narration"
                          >
                            <label className="block text-xs text-muted-foreground mb-1">
                              Narrator {nIdx + 2}
                            </label>
                            <textarea
                              value={narration}
                              onChange={(e) =>
                                updateNarration(i, nIdx, e.target.value)
                              }
                              className="w-full bg-background border border-foreground/10 p-2 resize-none text-xs rounded"
                              rows={3}
                            />
                            <div className="text-xs text-gray-600 mt-1 mb-2">
                              {narration.length}/200
                            </div>

                            {/* ADDITIONAL NARRATION CONTROLS */}
                            <div className="hidden group-hover/additional-narration:flex gap-1 absolute top-0 right-0">
                              <button
                                onClick={() =>
                                  moveNarration(i, nIdx, "up")
                                }
                                className="bg-primary text-white p-1 rounded hover:bg-primary text-primary-foreground"
                                title="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>

                              <button
                                onClick={() =>
                                  moveNarration(i, nIdx, "down")
                                }
                                className="bg-primary text-white p-1 rounded hover:bg-primary text-primary-foreground"
                                title="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              <button
                                onClick={() =>
                                  deleteNarration(i, nIdx)
                                }
                                className="bg-red-700 p-1 rounded hover:bg-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                <button
  onClick={() => addNarration(i)}
  className="flex items-center gap-1 text-primary text-xs hover:text-white transition"
>
  <Plus className="w-3 h-3" />
  Script.
</button>

                {/* VOICE SELECTION */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                    Voice
                  </label>
                  <Select
                    value={s.voice || "en-US-AriaNeural"}
                    onValueChange={(value) => {
                      const updated = { ...story };
                      updated.scenes[i].voice = value;
                      setStory(updated);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background border border-foreground/10 text-xs rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US-AriaNeural">Aria (US Female)</SelectItem>
                      <SelectItem value="en-US-GuyNeural">Guy (US Male)</SelectItem>
                      <SelectItem value="en-US-JennyNeural">Jenny (US Female)</SelectItem>
                      <SelectItem value="en-US-DavisNeural">Davis (US Male)</SelectItem>
                      <SelectItem value="en-US-AmberNeural">Amber (US Female)</SelectItem>
                      <SelectItem value="en-US-BrandonNeural">Brandon (US Male)</SelectItem>
                      <SelectItem value="en-GB-LibbyNeural">Libby (UK Female)</SelectItem>
                      <SelectItem value="en-GB-MaisieNeural">Maisie (UK Female)</SelectItem>
                      <SelectItem value="en-GB-RyanNeural">Ryan (UK Male)</SelectItem>
                      <SelectItem value="en-AU-NatashaNeural">Natasha (AU Female)</SelectItem>
                      <SelectItem value="en-AU-WilliamNeural">William (AU Male)</SelectItem>
                      <SelectItem value="es-ES-AlvaroNeural">Alvaro (Spanish Male)</SelectItem>
                      <SelectItem value="es-ES-ElviraNeural">Elvira (Spanish Female)</SelectItem>
                      <SelectItem value="fr-FR-BenedictNeural">Benedict (French Male)</SelectItem>
                      <SelectItem value="fr-FR-CelesteNeural">Celeste (French Female)</SelectItem>
                      <SelectItem value="de-DE-BerndNeural">Bernd (German Male)</SelectItem>
                      <SelectItem value="de-DE-YaraNeural">Yara (German Female)</SelectItem>
                      <SelectItem value="it-IT-DiegoNeural">Diego (Italian Male)</SelectItem>
                      <SelectItem value="it-IT-IsabellaNeural">Isabella (Italian Female)</SelectItem>
                      <SelectItem value="pt-BR-AntonioNeural">Antonio (Brazilian Portuguese Male)</SelectItem>
                      <SelectItem value="pt-BR-FranciscaNeural">Francisca (Brazilian Portuguese Female)</SelectItem>
                      <SelectItem value="ja-JP-DaichiNeural">Daichi (Japanese Male)</SelectItem>
                      <SelectItem value="ja-JP-NanamiNeural">Nanami (Japanese Female)</SelectItem>
                      <SelectItem value="zh-CN-YunyangNeural">Yunyang (Mandarin Male)</SelectItem>
                      <SelectItem value="zh-CN-XiaoxiaoNeural">Xiaoxiao (Mandarin Female)</SelectItem>
                      <SelectItem value="ko-KR-InJoonNeural">InJoon (Korean Male)</SelectItem>
                      <SelectItem value="ko-KR-SunHiNeural">SunHi (Korean Female)</SelectItem>
                      <SelectItem value="en-US-AriaNeural">Aria (Default)</SelectItem>
                    </SelectContent>
                  </Select>
                  {playingScene === i ? (
                    <button
                      onClick={stopPreview}
                      className="mt-2 w-full bg-red-600 hover:bg-red-700 p-2 rounded text-xs"
                    >
                      Stop Preview
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        previewVoice(
                          s.narration || "",
                          s.voice || "en-US-AriaNeural",
                          i
                        )
                      }
                      disabled={previewLoading === i}
                      className="mt-2 w-full bg-primary text-white hover:bg-primary/90 p-2 rounded text-xs"
                    >
                      {previewLoading === i
                        ? "Generating Preview..."
                        : "Preview Voice"}
                    </button>
                  )}
                </div>

                {/* BACKGROUND MUSIC SELECTION */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                    Background Music
                  </label>
                  <Select
                    value={s.bg_music || "lofi.mp3"}
                    onValueChange={(value) => {
                      const updated = { ...story };
                      updated.scenes[i].bg_music = value;
                      setStory(updated);
                      loadMusic(i, value);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background border border-foreground/10 text-xs rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {musicFiles.map((file) => (
                        <SelectItem key={file} value={file}>
                          {file}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* MUSIC PREVIEW */}
                {s.bg_music && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (
                          wavesurferRef.current[i]
                        ) {
                          wavesurferRef.current[
                            i
                          ].playPause();
                          setMusicPlaying({
                            ...musicPlaying,
                            [i]: !musicPlaying[i],
                          });
                        }
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded transition"
                      title="Play/Pause"
                    >
                      {musicPlaying[i] ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <div
                      ref={(el) => {
                        if (el) {
                          musicContainerRef.current[i] = el;
                          if (
                            !wavesurferRef.current[i]
                          ) {
                            const wavesurfer =
                              WaveSurfer.create({
                                container: el,
waveColor: "var(--primary)",
      progressColor:
        "var(--primary)",
                                url: `https://zoop-a1-v2.onrender.com/movie-generator/bg-music/${s.bg_music}`,
                                height: 40,
                                barWidth: 2,
                                barGap: 3,
                              });
                            wavesurferRef.current[
                              i
                            ] = wavesurfer;
                            wavesurfer.setVolume(
                              s.music_volume || 0.2
                            );
                            wavesurfer.on(
                              "play",
                              () => {
                                setMusicPlaying({
                                  ...musicPlaying,
                                  [i]: true,
                                });
                              }
                            );
                            wavesurfer.on(
                              "pause",
                              () => {
                                setMusicPlaying({
                                  ...musicPlaying,
                                  [i]: false,
                                });
                              }
                            );
                          } else {
                            wavesurferRef.current[
                              i
                            ].setVolume(
                              s.music_volume || 0.2
                            );
                          }
                        }
                      }}
                      className="flex-1 bg-background border border-foreground/10 rounded-xl"
                    />
                  </div>
                )}

                {/* MUSIC VOLUME SLIDER */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                    Music Volume
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={s.music_volume || 0.2}
                    onChange={(e) => {

                      const updated = { ...story };

                      updated.scenes[i].music_volume =
                        Number(e.target.value);

                      setStory(updated);

                    }}
                    className="w-full accent-primary"
                  />
                </div>

                {/* SUBTITLE TEXT COLOR */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                    Subtitle Text Color
                  </label>
                  <input
                    type="color"
                    value={s.text_color || "#ffffff"}
                    onChange={(e) => {
                      const updated = { ...story };
                      updated.scenes[i].text_color = e.target.value;
                      setStory(updated);
                    }}
                    className="w-full h-8 rounded border border-foreground/10"
                  />
                </div>

                {/* IMAGE PROMPT */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                    Image Prompt
                  </label>
                  <div className="group/image">
                    <textarea
                      value={s.image_prompt || ""}
                      onChange={(e) =>
                        updateScene(i, "image_prompt", e.target.value)
                      }
                      className="w-full bg-background border border-foreground/10 p-2 resize-none overflow-y-auto text-xs rounded"
                      rows={4}
                    />
                    <div className="hidden group-hover/image:flex mt-1">
  <button
  onClick={handleOpenLibrary}
  className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
  text-white transition-all duration-200
  active:scale-95"
  title="Video Library"
  >
  <Save className="w-4 h-4" />
  </button>
                    </div>
                  </div>
                </div>

                {/* ANIMATION SELECT */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                    Animation
                  </label>

                  <select
                    value={s.animation || "none"}
                    onChange={(e) =>
                      updateScene(i, "animation", e.target.value)
                    }
                    className="w-full bg-background border border-foreground/10 text-xs p-1 rounded"
                  >
                    <option value="none">None</option>
                    <option value="zoom_in">Zoom In</option>
                    <option value="zoom_out">Zoom Out</option>
                    <option value="pan_zoom">Pan Zoom</option>
                    <option value="fade">Fade</option>
                  </select>
                </div>

                {/* SMALL IMAGE PREVIEW */}
                {s.image_url && (
                  <div className="mt-2">
                    <img
                      src={s.image_url}
                      alt={`Scene ${s.scene_number}`}
                      className="w-full rounded border border-foreground/10"
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* VIDEO LIBRARY MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-background/50 z-50">

          <div
            className="
            absolute
            right-0
            top-0
            h-full
            w-full
            md:w-2/3
            lg:w-1/2
            bg-background
            border-l
            border-primary
            animate-in
            slide-in-from-right
            duration-500
            overflow-y-auto
            p-6
            "
          >

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">
                Video Library
              </h2>
              <button
                onClick={() =>
                  setShowVideoModal(false)
                }
                className="text-muted-foreground hover:text-primary"
              >
                ✕
              </button>
            </div>

            {/* Loading State */}
            {loadingVideos && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {/* Video Carousel */}
            {!loadingVideos && savedVideos.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {savedVideos.map((video) => (
                    <button
                      key={video.name}
                      onClick={() =>
                        setSelectedVideoUrl(
                          video.url
                        )
                      }
                      className={`flex-shrink-0 border-2 rounded ${
                        selectedVideoUrl ===
                        video.url
                          ? "border-primary"
                          : "border-foreground/10"
                      }`}
                    >
                      <video
                        src={video.url}
                        className="w-40 h-32 object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Selected Video Preview */}
                {selectedVideoUrl && (
                  <div className="mt-6">
                    <video
                      src={selectedVideoUrl}
                      controls
                      className="w-full rounded border border-primary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loadingVideos && savedVideos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  No videos saved yet. Generate and
                  upload videos to see them here.
                </p>
              </div>
            )}

          </div>
        </div>
      )}
      </aside>
      </div>
    </div>
  );
}
