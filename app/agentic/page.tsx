'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ChevronLeft, 
 
  ArrowRight,
  Sparkles, 
  Copy, 

  Search,
  ArrowUp,
  Brain,
  Lightbulb,
  X,

  Trash2,
  Edit2,
  User,
} from 'lucide-react'
import Footer from '@/components/footer'
import { inputClass, primaryButton } from '@/components/vivafy-header'
import ReactMarkdown from 'react-markdown'

export default function AiAgentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])
  const [loading, setLoading] = useState(false)
  const [showGreeting, setShowGreeting] = useState(true)
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; time: string; messages: Array<{ role: string; content: string }> }>>([])
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [username, setUsername] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string }>>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; time: string; messages: Array<{ role: string; content: string }> }>>([])
  const [userAvatar, setUserAvatar] = useState<string>('')

  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error("[v0] User not authenticated")
          return
        }
        
        setUserId(user.id)
        
        // Fetch username from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        
        if (!profileError && profileData && profileData.username) {
          setUsername(profileData.username)
        }
        
        // Fetch chat history from zoop-chats table
        const { data: chatsData, error: chatsError } = await supabase
          .from('zoop-chats')
          .select('id, title, messages, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (!chatsError && chatsData) {
          const formattedSessions = chatsData.map(chat => ({
            id: chat.id,
            title: chat.title,
            time: new Date(chat.created_at).toLocaleDateString(),
            messages: chat.messages
          }))
          setSessions(formattedSessions)
        }
      } catch (err) {
        console.error("[v0] Error fetching user data:", err)
      }
    }
    
    fetchUserAndChats()
  }, [])





  const handleNewChat = () => {
    setChatHistory([])
    setCurrentSession(null)
    setShowGreeting(true)
    setMessage('')
  }

  const saveOrUpdateChat = async (title: string, messages: Array<{ role: string; content: string }>) => {
    if (!userId) return

    try {
      if (currentSession) {
        // Update existing chat
        const { error } = await supabase
          .from('zoop-chats')
          .update({ title, messages, updated_at: new Date().toISOString() })
          .eq('id', currentSession)
          .eq('user_id', userId)
        
        if (error) console.error("[v0] Error updating chat:", error)
      } else {
        // Create new chat
        const { data, error } = await supabase
          .from('zoop-chats')
          .insert({
            user_id: userId,
            title,
            messages,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()

        if (error) {
          console.error("[v0] Error saving chat:", error)
        } else if (data && data[0]) {
          setCurrentSession(data[0].id)
          setSessions([{
            id: data[0].id,
            title,
            time: 'Now',
            messages
          }, ...sessions])
        }
      }
    } catch (err) {
      console.error("[v0] Error in saveOrUpdateChat:", err)
    }
  }

  const deleteChat = async (sessionId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('zoop-chats')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) {
        console.error("[v0] Error deleting chat:", error)
      } else {
        setSessions(sessions.filter(s => s.id !== sessionId))
        if (currentSession === sessionId) {
          handleNewChat()
        }
      }
    } catch (err) {
      console.error("[v0] Error in deleteChat:", err)
    }
  }

  const updateChatTitle = async (sessionId: string, newTitle: string) => {
    if (!userId || !newTitle.trim()) return

    try {
      const { error } = await supabase
        .from('zoop-chats')
        .update({ title: newTitle })
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) {
        console.error("[v0] Error updating title:", error)
      } else {
        setSessions(sessions.map(s => 
          s.id === sessionId ? { ...s, title: newTitle } : s
        ))
        setEditingSessionId(null)
        setEditingTitle('')
      }
    } catch (err) {
      console.error("[v0] Error in updateChatTitle:", err)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results = sessions.filter(session =>
      session.title.toLowerCase().includes(query) ||
      session.messages.some(msg => msg.content.toLowerCase().includes(query))
    )
    setSearchResults(results)
  }

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        type: file.type
      }))
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (idx: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))
  }

  const handleSendWithFiles = async () => {
    if (!message.trim() && uploadedFiles.length === 0) return

    setLoading(true)
    setShowGreeting(false)

    let userContent = message
    if (uploadedFiles.length > 0) {
      userContent += `\n\n[Attached files: ${uploadedFiles.map(f => f.name).join(', ')}]`
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "sk-6898652a88be42bf871d001c895b5504"}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            ...chatHistory,
            { role: 'user', content: `${userContent}\n\nIMPORTANT: Please respond in English only. Format your response with proper markdown including:\n- Use **bold** for important terms\n- Use proper heading levels (# ## ###) for structure\n- Use numbered lists (1. 2. 3.) for ordered items\n- Use bullet points (-) for unordered lists\n- Use tables when presenting data in rows and columns with | separators\n- Use > for blockquotes when needed\n- Use code blocks with triple backticks for code\nMake the response well-structured and visually clear.` }
          ],
          stream: false,
        }),
      })

      const data = await response.json()

      if (data.choices && data.choices[0].message) {
        const assistantMessage = data.choices[0].message.content
        const newHistory = [
          ...chatHistory,
          { role: 'user', content: userContent },
          { role: 'assistant', content: assistantMessage }
        ]
        setChatHistory(newHistory)

        const chatTitle = message.substring(0, 50) + (message.length > 50 ? '...' : '')
        await saveOrUpdateChat(chatTitle, newHistory)

        setMessage('')
        setUploadedFiles([])
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    } catch (err) {
      console.error('[v0] AI Agent error:', err)
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
  { icon: Sparkles, title: 'Create an ad', subtitle: 'Turn your product into a winning video ad.' },
  { icon: Lightbulb, title: 'Improve performance', subtitle: 'Find new ways to make your ads convert.' },
  { icon: Brain, title: 'Scale your ads', subtitle: 'Go from 10 ads a month to 10,000.' },
  ]

  return (
    <main className="min-h-screen bg-white text-[#5b5a98] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-[#5b5a98]/20 flex flex-col transition-all duration-300 overflow-y-auto`}>
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-4 hover:bg-white/5 transition-colors flex items-center justify-center"
          >
            <ChevronLeft size={24} className={`transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          {sidebarOpen && (
            <>
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className={`${primaryButton} mx-4 mb-6`}
              >
               
                <span>New Chat</span>
            
              </button>

              {/* Chat History */}
              <div className="flex-1 px-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-400">Chat History</h3>
                  <button onClick={() => setShowSearchModal(true)} className="hover:text-gray-300 transition-colors">
                    <Search size={16} className="text-gray-500" />
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No chats yet</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map(session => (
                      <div
                        key={session.id}
                        className="group flex items-center gap-2 text-sm p-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        {editingSessionId === session.id ? (
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateChatTitle(session.id, editingTitle)
                              } else if (e.key === 'Escape') {
                                setEditingSessionId(null)
                              }
                            }}
                            className="flex-1 bg-white/20 text-[#5b5a98] px-2 py-1 rounded text-xs outline-none"
                            onBlur={() => updateChatTitle(session.id, editingTitle)}
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentSession(session.id)
                              setChatHistory(session.messages)
                              setShowGreeting(false)
                            }}
                            className="flex-1 text-left text-gray-300 hover:text-[#5b5a98] truncate"
                          >
                            <p className="truncate">{session.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{session.time}</p>
                          </button>
                        )}
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => {
                              setEditingSessionId(session.id)
                              setEditingTitle(session.title)
                            }}
                            className="p-1 hover:bg-white/30 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} className="text-gray-400 hover:text-[#5b5a98]" />
                          </button>
                          <button
                            onClick={() => deleteChat(session.id)}
                            className="p-1 hover:bg-red-600/30 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-end border-b border-[#8b2de21f] px-6 py-4">
            <button onClick={() => { window.location.href = '/dashboard' }} className="rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
              <ArrowRight className="mr-2 inline-block size-4 rotate-180" /> Back to Home
            </button>
          </header>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {showGreeting ? (
              <>
                {/* Greeting Section */}
                <div className="flex flex-col items-center justify-center py-8 mb-12">
                  <h1 className="text-5xl font-bold mb-4">
                    AI Ads that win.
                  </h1>
                  <p className="text-xl text-gray-400 max-w-2xl text-center">
                    AI-generated video ads that actually convert — at the scale your business needs.
                  </p>
                  <p className="text-base text-gray-400 max-w-2xl text-center mt-3">
                    From 10 ads a month to 10,000. The #1 AI Ad Platform Built for Performance.
                  </p>
                  <p className="text-base text-gray-400 max-w-2xl text-center mt-2">
                    Turn any product page into a winning video ad—created, tested, and optimized in minutes.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {quickPrompts.map((prompt, idx) => {
                    const IconComponent = prompt.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => setMessage(`${prompt.title} ${prompt.subtitle}`)}
                        className="group rounded-2xl border border-[#8b2de233] bg-[linear-gradient(145deg,#ffffff_0%,#fbf8ff_52%,#f2fbff_100%)] p-6 text-left transition-all hover:-translate-y-1 hover:border-[#17d5da99] hover:shadow-[0_14px_30px_rgba(139,45,226,0.12)]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8b2de2,#17d5da)] text-white shadow-[0_8px_18px_rgba(139,45,226,0.2)]"><IconComponent size={22} /></span>
                        </div>
                        <p className="text-sm font-medium text-[#252548] mb-1">{prompt.title}</p>
                        <p className="text-xs text-gray-400">{prompt.subtitle}</p>
                        <div className="mt-4 flex justify-end">
                          <ArrowRight size={16} className="text-gray-600 group-hover:text-[#5b5a98] transition-colors" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
                  >
                    <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} items-start max-w-2xl`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {msg.role === "user" ? (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#5b5a98]">
                            <User size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5a98] to-[#5b5a98] flex items-center justify-center text-[#5b5a98] text-xs font-bold">
                            AI
                          </div>
                        )}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-white text-[#5b5a98]"
                            : "bg-white/5 border border-[#5b5a98]/20 text-[#5b5a98]"
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
                                code: ({ ...props }) => <code className="bg-white/50 px-2 py-1 rounded text-xs" {...props} />,
                                pre: ({ ...props }) => <pre className="bg-white/50 p-3 rounded-lg overflow-x-auto mb-2" {...props} />,
                                blockquote: ({ ...props }) => <blockquote className="border-l-4 border-[#5b5a98] pl-4 italic text-gray-300 mb-2" {...props} />,
                                table: ({ ...props }) => <table className="border-collapse border border-[#5b5a98]/20 mb-2 text-xs" {...props} />,
                                th: ({ ...props }) => <th className="border border-[#5b5a98]/20 px-2 py-1 bg-white/50" {...props} />,
                                td: ({ ...props }) => <td className="border border-[#5b5a98]/20 px-2 py-1" {...props} />,
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded mt-1"
                        >
                          {copiedIdx === idx ? (
                            <span className="text-xs text-green-400">✓</span>
                          ) : (
                            <Copy size={16} className="text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 text-[#5b5a98]">
                      <p className="text-sm">
                        <span className="inline-block animate-bounce">.</span>
                        <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-4 py-4 border-t border-[#5b5a98]/20">
            <div className="rounded-2xl border border-[#5b5a98]/20 bg-white hover:border-[#5b5a98]/35 transition-colors p-3">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendWithFiles()
                  }
                }}
                placeholder="Message Vivafy AI..."
                className={`w-full resize-none min-h-12 max-h-32 overflow-y-auto text-sm leading-relaxed outline-none scrollbar-thin scrollbar-thumb-[#7435df] scrollbar-track-white ${inputClass}`}
                rows={2}
              />

              {/* Input Actions */}
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  onClick={handleSendWithFiles}
                  disabled={loading || (!message.trim() && uploadedFiles.length === 0)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowUp size={18} className="text-[#5b5a98]" />
                </button>
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/20 border border-[#5b5a98]/20 rounded-lg px-2 py-1 text-xs">
                      <span className="text-gray-300">{file.name}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-0.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <X size={12} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Disclaimer */}
            <p className="text-xs text-gray-500 text-center mt-3">
              Vivafy AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#5b5a98]/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#5b5a98]/20">
              <h2 className="text-lg font-bold text-[#5b5a98]">Search Chat History</h2>
              <button
                onClick={() => {
                  setShowSearchModal(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-[#5b5a98]/20">
              <input
                autoFocus
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by title or content..."
                className={`w-full rounded-lg px-4 py-2 outline-none transition-colors ${inputClass}`}
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searchQuery.trim() === '' ? (
                <p className="text-gray-400 text-sm text-center py-8">Type to search...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No chats found</p>
              ) : (
                searchResults.map(result => (
                  <button
                    key={result.id}
                    onClick={() => {
                      setCurrentSession(result.id)
                      setChatHistory(result.messages)
                      setShowGreeting(false)
                      setShowSearchModal(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <p className="text-[#5b5a98] text-sm font-medium group-hover:text-[#5b5a98] transition-colors">{result.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{result.time}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
