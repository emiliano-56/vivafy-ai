'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2, MessageCircle, Copy, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to remove markdown formatting
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
    .replace(/__(.*?)__/g, '$1') // Remove bold __text__
    .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
    .replace(/_(.*?)_/g, '$1') // Remove italic _text_
    .replace(/#{1,6}\s*/g, '') // Remove headers ###
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
    .trim();
};

interface DeepSeekModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeepSeekModal({ isOpen, onClose }: DeepSeekModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the UI immediately
    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage = '';
      const decoder = new TextDecoder();

      // Create placeholder for assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const deltaContent = parsed.choices?.[0]?.delta?.content;

              if (deltaContent) {
                assistantMessage += deltaContent;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantMessage;
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors for non-JSON lines
            }
          }
        }
      }

      reader.releaseLock();
    } catch (error) {
      console.error('[v0] Error fetching from DeepSeek:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyToClipboard = (text: string, index: number) => {
    const cleanedText = cleanMarkdown(text);
    navigator.clipboard.writeText(cleanedText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background bg-opacity-50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Modal Slide-in from Right */}
      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-96 bg-background shadow-2xl z-50 transition-transform duration-300 ease-out flex flex-col overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/70">
          <h2 className="text-lg font-semibold text-foreground">
            Ai Assistance
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-background p-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4b5563 transparent'
        }}>
          <style>{`
            .messages-container::-webkit-scrollbar {
              width: 8px;
            }
            .messages-container::-webkit-scrollbar-track {
              background: transparent;
            }
            .messages-container::-webkit-scrollbar-thumb {
              background: #4b5563;
              border-radius: 4px;
            }
            .messages-container::-webkit-scrollbar-thumb:hover {
              background: #6b7280;
            }
          `}</style>
          <div className="messages-container space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center text-slate-400">
                <MessageCircle className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-foreground">Start a conversation...</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 group relative ${
                        message.role === 'user'
                          ? 'bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white rounded-br-none'
                          : 'bg-background text-foreground rounded-bl-none border border-border/70'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {cleanMarkdown(message.content)}
                      </p>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleCopyToClipboard(message.content, index)}
                          className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-slate-700 rounded"
                          aria-label="Copy message"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background rounded-lg rounded-bl-none px-4 py-3 border border-border/70">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                        <span className="text-sm text-slate-300 ml-1">Thinking</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/70 p-4 space-y-3 bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-card text-foreground placeholder-muted-foreground border-border/70 "
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white transition hover:brightness-110"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
