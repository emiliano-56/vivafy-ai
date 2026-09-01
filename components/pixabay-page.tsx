"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Search,
} from "lucide-react";

interface Image {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  likes: number;
}

const ANIMATED_TEXTS = [
  "Search for stunning images",
  "Pick visuals that tell a story",
  "Arrange scenes your way",
  "Add scripts to each moment",
  "Turn images into a powerful story",
];

interface PixabayPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PixabayPage({ isOpen, onClose }: PixabayPageProps) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [textIndex, setTextIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const searchImages = async (page = 1) => {
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/pixabay?q=${query}&per_page=12&page=${page}`
      );
      const data = await res.json();
      setImages(data.hits || []);
      setCurrentPage(page);
      setTotalPages(Math.ceil((data.totalHits || 0) / 12));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const copyToClipboard = (url: string, imgId: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(`img-${imgId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ANIMATED_TEXTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* SLIDE-IN MODAL FROM RIGHT */}
      {isOpen && (
        <>
          {/* Backdrop - Transparent */}
          <div 
            className="fixed inset-0 bg-transparent z-40 animate-fadeIn"
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-6xl bg-background border-l border-border/70 text-foreground z-50 overflow-hidden animate-slideInRight">
            <div className="w-full h-full flex flex-col bg-background">

            {/* HEADER */}
            <div className="flex-shrink-0 p-6 border-b border-border/70 bg-background sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-primary-500">
                  Create Your Story
              </h2>
              <p className="text-muted-foreground mt-2">
            Search images, build scenes, and bring your story to life.

              </p>
            </div>

            {/* BODY - Full scrollable content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 md:px-16 py-8 bg-background scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
              <div className="max-w-full">

              {/* Animated Text (NO GRADIENT) */}
              <div className="mb-12 p-8 bg-background border border-border/70 rounded-lg">
                <div className="min-h-24 flex items-center justify-center">
                  <h2
                    key={textIndex}
                    className="text-3xl md:text-4xl font-bold text-primary-400 animate-fadeInOut text-center"
                  >
                    {ANIMATED_TEXTS[textIndex]}
                  </h2>
                </div>
              </div>

              {/* SEARCH */}
              <div className="flex gap-4 mb-10 max-w-7xl mx-auto items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search images..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && searchImages(1)
                    }
                    className="bg-background border-border/70 text-foreground text-base py-6 pl-12 pr-4 rounded-lg  transition"
                  />
                </div>

                <Button
                  onClick={() => searchImages(1)}
                  disabled={loading}
                  className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 px-12 py-6 text-base font-semibold rounded-lg transition disabled:opacity-75"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* GRID */}
              {images.length > 0 && (
                <div className="mb-8">
                  <div className="
                    grid 
                    grid-cols-1 
                    sm:grid-cols-2 
                    md:grid-cols-3 
                    lg:grid-cols-4 
                    xl:grid-cols-5 
                    2xl:grid-cols-6 
                    gap-6
                  ">
                    {images.map((img) => (
                      <Card
                        key={img.id}
                        className="bg-background border-border/70 overflow-hidden hover:shadow-2xl transition group cursor-pointer"
                        onClick={() => setSelectedImage(img)}
                      >
                        <div className="relative aspect-square">
                          <img
                            src={img.webformatURL}
                            alt={img.tags}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(
                                img.largeImageURL,
                                img.id
                              );
                            }}
                            className="absolute top-3 right-3 bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110 text-primary-foreground p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                          >
                            {copiedId === `img-${img.id}` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="p-3 text-sm text-muted-foreground">
                          <p className="text-xs text-muted-foreground">
                            By {img.user} • {img.likes} likes
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <Button
                        onClick={() =>
                          searchImages(currentPage - 1)
                        }
                        disabled={currentPage === 1 || loading}
                        variant="outline"
                        className="border-border/70 bg-background hover:bg-gray-900"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <span className="text-muted-foreground text-lg">
                        {currentPage} / {totalPages}
                      </span>

                      <Button
                        onClick={() =>
                          searchImages(currentPage + 1)
                        }
                        disabled={
                          currentPage === totalPages || loading
                        }
                        variant="outline"
                        className="border-border/70 bg-background hover:bg-gray-900"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE VIEWER */}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-background/95 flex items-center justify-center z-50"
                  onClick={() => setSelectedImage(null)}
                >
                  <div
                    className="w-[98vw] max-w-[1800px] h-[94vh] bg-background rounded-xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <img
                        src={selectedImage.largeImageURL}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="p-4 border-t border-black flex justify-between items-center">
                      <span className="text-black text-sm">
                        By {selectedImage.user}
                      </span>

                      <Button
                        onClick={() => setSelectedImage(null)}
                        className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] hover:brightness-110"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition z-50"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
          </div>
        </>
      )}

      {/* Animation & Scrollbar Styling */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 4s ease-in-out;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #000000;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </>
  );
}
