"use client";

import { useState, useEffect } from "react";
import { Save, Download, ArrowLeft, Wand2, History, Trash2, Share2, X, Eye, MoreVertical } from "lucide-react";
import Link from "next/link";
import { DeepSeekModal } from "@/components/deepseek-modal";
 import Footer from "@/components/footer";
 import { VivafyHeader, primaryButton, inputClass } from "@/components/vivafy-header";
import { supabase } from "@/lib/supabase";

/* =====================================================
   MESSAGE TYPES
===================================================== */
type Message =
  | {
      role: "user";
      content: string;
    }
  | {
      role: "ai";
      image: string;
    };

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  /* =====================================================
     ASPECT RATIO STATE
  ===================================================== */
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [isDeepSeekOpen, setIsDeepSeekOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedImages, setSavedImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fullscreenHistoryImage, setFullscreenHistoryImage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /* =====================================================
     GET USER
  ===================================================== */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  /* =====================================================
     LOAD SAVED IMAGES
  ===================================================== */
  const loadSavedImages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSavedImages(data);
    }
  };

  const handleHistoryOpen = () => {
    setIsHistoryOpen(true);
    loadSavedImages();
  };

  /* =====================================================
     SHOW TOAST MESSAGE
  ===================================================== */
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  /* =====================================================
     DOWNLOAD IMAGE
  ===================================================== */
  const downloadImage = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
      showToast("Image downloaded");
    } catch (err) {
      console.log("❌ Download failed:", err);
    }
  };

  /* =====================================================
     UPLOAD IMAGE TO SUPABASE
  ===================================================== */
  const uploadToSupabase = async (imageUrl: string) => {
    if (!imageUrl || !user) {
      showToast("You must be logged in");
      return;
    }

    setUploadingImage(imageUrl);

    try {
      // Fetch image via proxy (avoids CORS issues)
      const proxyRes = await fetch("/api/proxy-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!proxyRes.ok) {
        throw new Error("Failed to fetch image via proxy");
      }

      const { base64, mimeType } = await proxyRes.json();

      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const fileName = `${user.id}/${Date.now()}.png`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, blob, {
          contentType: "image/png",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Save in database
      await supabase.from("images").insert({
        url: publicUrl,
        user_id: user.id,
        prompt: input,
      });

      showToast("✅ Image saved successfully!");
      setUploadingImage(null);
    } catch (err) {
      showToast("❌ Upload failed");
      setUploadingImage(null);
      console.log("Upload error:", err);
    }
  };

  /* =====================================================
     DELETE IMAGE FROM SUPABASE
  ===================================================== */
  const deleteImage = async (imageId: string, fileName: string) => {
    try {
      // Delete from storage
      await supabase.storage.from("images").remove([fileName]);

      // Delete from database
      await supabase.from("images").delete().eq("id", imageId);

      // Update UI
      setSavedImages((prev) => prev.filter((img) => img.id !== imageId));
      console.log("✅ Image deleted!");
    } catch (err) {
      console.log("❌ Delete failed:", err);
    }
  };

  /* =====================================================
     SHARE IMAGE
  ===================================================== */
  const shareImage = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out my AI generated image!",
          url: imageUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(imageUrl);
        alert("Image URL copied to clipboard!");
      }
    } catch (err) {
      console.log("Share failed:", err);
    }
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      alert("You must be logged in");
      return;
    }

    const requiredCredits = currentImage ? 10 : 10; // 10 credits for both generation and edit

    // Check credits
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profileData) {
      alert("Failed to check credits");
      return;
    }

    if (profileData.credits < requiredCredits) {
      alert(`Insufficient credits. You need ${requiredCredits} credits to generate/edit an image.`);
      return;
    }

    const userMessage = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setLoading(true);

    try {
      const endpoint = currentImage
        ? "https://zoop-a1-v2.onrender.com/qwen/edit-image"
        : "https://zoop-a1-v2.onrender.com/qwen/generate-image";

      const payload = currentImage
        ? {
            image_url: currentImage,
            instruction: userMessage,
          }
        : {
            prompt: userMessage,
            aspect_ratio: aspectRatio, // ✅ NEW
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("📦 API RESPONSE:", data);

      const imageUrl: string = data.image_url;

      if (!imageUrl) {
        console.log("❌ No image_url returned");
        setLoading(false);
        return;
      }

      // Deduct credits
      await supabase
        .from('profiles')
        .update({ credits: profileData.credits - requiredCredits })
        .eq('id', userData.user.id);

      setCurrentImage(imageUrl);

      setMessages((prev) => [
        ...prev,
        { role: "ai", image: imageUrl },
      ]);
    } catch (err) {
      console.log("❌ Error:", err);
    }

    setLoading(false);
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6">
      <DeepSeekModal isOpen={isDeepSeekOpen} onClose={() => setIsDeepSeekOpen(false)} />

      <VivafyHeader />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-4 right-4 text-foreground text-sm z-40">
          {toast}
        </div>
      )}

      {/* HISTORY MODAL - RIGHT SIDE SLIDE-IN */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 bg-background border-l border-border/70 shadow-2xl transform transition-transform duration-300 z-50 ${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-border/70">
          <h2 className="text-xl font-bold text-foreground">Saved Images</h2>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="text-foreground hover:bg-white/10 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* IMAGES GRID */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
          {savedImages.length === 0 ? (
            <p className="text-foreground/50 text-center py-8">No saved images yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {savedImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt="saved"
                    className="w-full h-40 object-cover rounded-lg border border-border/70"
                  />

                  {/* HOVER ACTIONS - TOP POSITIONED WITH DROPDOWN MENU */}
                  <div className="absolute top-0 left-0 right-0 bg-background/60 opacity-0 group-hover:opacity-100 transition rounded-t-lg flex items-center justify-between px-2 py-2 gap-1">
                    {/* VISIBLE ICONS: Eye + Download */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setFullscreenHistoryImage(img.url)}
                        className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground p-2 rounded-full hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 transition border border-primary-400/30"
                        title="View fullscreen"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => downloadImage(img.url)}
                        className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground p-2 rounded-full hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)] transition border border-primary-300/30"
                        title="Download image"
                      >
                        <Download size={14} />
                      </button>
                    </div>

                    {/* MORE OPTIONS MENU - Click-triggered dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === img.id ? null : img.id)
                        }}
                        className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground p-2 rounded-full hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 transition border border-primary-400/30"
                        title="More options"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {/* DROPDOWN MENU - Shows on click */}
                      {openMenuId === img.id && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-border/70 rounded-lg shadow-lg z-20 py-1 w-40">
                          <button
                            onClick={() => {
                              shareImage(img.url)
                              setOpenMenuId(null)
                            }}
                            className="w-full text-left px-3 py-2 text-foreground hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]/30 transition flex items-center gap-2 text-sm"
                            title="Share image"
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                          <button
                            onClick={() => {
                              deleteImage(img.id, img.url.split("/").pop())
                              setOpenMenuId(null)
                            }}
                            className="w-full text-left px-3 py-2 text-foreground hover:bg-red-600/30 transition flex items-center gap-2 text-sm"
                            title="Delete image"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col items-center mb-5">
        <h1 className="text-3xl font-bold">AI Image Chat Studio</h1>
        <p className="text-foreground text-sm mt-1">
          Create & evolve images like a conversation
        </p>
      </div>

      {/* ASPECT RATIO SELECTOR */}
      <div className="flex gap-2 mb-4 items-center">
        {["1:1", "16:9", "9:16", "4:3"].map((ratio) => (
          <button
            key={ratio}
            onClick={() => setAspectRatio(ratio)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              aspectRatio === ratio
                ? "bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground"
                : "border-border/70 text-foreground"
            }`}
          >
            {ratio}
          </button>
        ))}
        <button
          onClick={handleHistoryOpen}
          className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground px-3 py-1 rounded-full hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 transition"
          title="View saved images"
        >
          <History size={16} />
        </button>
        <button
          onClick={() => setIsDeepSeekOpen(true)}
          className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground px-3 py-1 rounded-full hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 transition"
          title="Open AI Assistant"
        >
          <Wand2 size={16} />
        </button>
      </div>

      {/* CHAT */}
      <div className="w-full max-w-4xl bg-background rounded-2xl p-4 sm:p-5 h-[280px] overflow-y-auto overflow-x-hidden space-y-4 ">

        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col">

            {/* USER MESSAGE */}
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-primary to-primary px-4 py-2 rounded-2xl max-w-xs sm:max-w-sm md:max-w-md text-sm font-normal text-foreground break-words">
                  {msg.content}
                </div>
              </div>
            ) : (
              /* AI IMAGE CARD */
              <div className="flex justify-start group relative w-full">

                <div className="relative bg-background p-2 rounded-2xl shadow-lg border border-border/70">

                  {/* IMAGE */}
                  <img
                    src={msg.image}
                    alt="generated"
                    className="rounded-xl max-w-xs sm:max-w-sm md:max-w-md"
                  />

                  {/* HOVER OVERLAY - TOP BORDER */}
                  <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">

                    <button
                      onClick={() => downloadImage(msg.image)}
                      className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-primary-foreground p-2 rounded-full hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 transition flex items-center justify-center shadow-lg border border-primary-400/30"
                      title="Download image"
                    >
                      <Download size={18} />
                    </button>

                    <button
                      onClick={() => uploadToSupabase(msg.image)}
                      disabled={uploadingImage === msg.image}
                      className={`text-foreground p-2 rounded-full transition flex items-center justify-center shadow-lg border ${
                        uploadingImage === msg.image
                          ? "bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 border-primary-400/50 animate-spin"
                          : "bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 border-primary-400/30"
                      }`}
                      title="Save to our storage"
                    >
                      <Save size={18} />
                    </button>

                  </div>

                </div>

              </div>
            )}
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="text-foreground text-sm animate-pulse">
            Creating your image...
          </div>
        )}
      </div>

      {/* INPUT - CURVED C-SHAPE WITH NESTED BUTTON */}
      <div className="w-full max-w-4xl mt-6 mb-8 px-4 sm:px-0">
        <div className="relative inline-flex w-full items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && sendMessage()}
            placeholder={
              currentImage
                ? "Edit this image (Ctrl+Enter to send)..."
                : "Describe your image (Ctrl+Enter to send)..."
            }
            className="flex-1 p-3 pr-20 rounded-l-3xl rounded-r-3xl bg-card outline-none border border-border/70 focus:border-primary  transition text-foreground placeholder-muted-foreground resize-none h-16 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-4 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white hover:bg-[linear-gradient(90deg,#8b2de2,#17d5da)]-700 transition rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 text-foreground flex-shrink-0"
            title="Send message"
          >
            <ArrowLeft size={18} className="rotate-180" />
          </button>
        </div>
      </div>
      <Footer />

      {/* FULLSCREEN IMAGE MODAL - HISTORY */}
      {fullscreenHistoryImage && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={fullscreenHistoryImage} 
              alt="fullscreen" 
              className="max-w-full max-h-full object-contain"
            />
            <button 
              onClick={() => setFullscreenHistoryImage(null)}
              className="absolute top-4 right-4 text-foreground bg-background bg-opacity-50 hover:bg-opacity-70 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
