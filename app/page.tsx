"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Repeat2, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockPosts } from "@/lib/mock-data"
import { useMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"

// Update supported cryptocurrencies
const SUPPORTED_CRYPTOS = [
  { name: "Bitcoin", symbol: "BTC", logo: "/crypto-logos/btc.svg" },
  { name: "Ethereum", symbol: "ETH", logo: "/crypto-logos/eth.svg" },
  { name: "Dogecoin", symbol: "DOGE", logo: "/crypto-logos/doge.svg" },
  { name: "Solana", symbol: "SOL", logo: "/crypto-logos/sol.svg" },
] as const

type CryptoInfo = {
  name: string
  symbol: string
  logo: string
}

// Update Post type to include more crypto info
type Post = {
  id: string
  imageUrl: string
  caption: string
  crypto: CryptoInfo
  timestamp: string
  likes: number
  comments: number
  shares: number
  username: string
  userHandle: string
  verified: boolean
  avatarUrl: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [subscribedPosts, setSubscribedPosts] = useState<Set<Post>>(new Set())
  const [subscribedUsers, setSubscribedUsers] = useState<Set<string>>(new Set())
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoInfo>(SUPPORTED_CRYPTOS[0])
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const isMobile = useMobile()
  const [loading, setLoading] = useState(false)
  const [customCrypto, setCustomCrypto] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [subscribedPost, setSubscribedPost] = useState<Post | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: "posts from the perspective of bitcoin that sound suggestive",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const handleGeneratePosts = async () => {
    setIsGenerating(true)
    try {
      setLoading(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: `posts from the perspective of ${selectedCrypto.name} that sound suggestive`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
      setLoading(false);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      setIsGenerating(false);
    }
  }

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
        // Remove from subscribed posts
        setSubscribedPost(null)
      } else {
        newSet.add(postId)
        // Add to subscribed posts
        const post = posts.find(p => p.id === postId)
        if (post) {
          setSubscribedPost(post)
        }
      }
      return newSet
    })
  }

  const toggleSubscribe = (username: string, post: Post) => {
    setSubscribedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(username)) {
        newSet.delete(username)
        // Remove post from collection
        setSubscribedPosts(prev => {
          const newPosts = new Set(prev)
          newPosts.delete(post)
          return newPosts
        })
      } else {
        newSet.add(username)
        // Add post to collection
        setSubscribedPosts(prev => {
          const newPosts = new Set(prev)
          newPosts.add(post)
          return newPosts
        })
      }
      return newSet
    })
  }

  const generatePostId = () => {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const generateSexyDescription = async (crypto: CryptoInfo): Promise<string> => {
    // This would normally call an AI service API
    // For now, we'll use template-based generation
    const templates = [
      `Hey crypto lovers! 💋 Your favorite ${crypto.name} is feeling extra spicy today! 🌶️ Who's ready to HODL me tight? 🤗 #${crypto.symbol} #ToTheMoon`,
      `${crypto.name} here, and I'm feeling bullish and beautiful! 💃 Watch me break through resistance like it's nothing! 💪 #${crypto.symbol} #CryptoQueen`,
      `Just your favorite ${crypto.name} being irresistible as usual! 😘 My chart's looking as hot as I feel! 📈 #${crypto.symbol} #CryptoGoddess`,
      `Feeling sexy and volatile - just how you like me! 😏 ${crypto.name}'s ready to make some moves! 🚀 #${crypto.symbol} #CryptoLife`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  const generateImage = async (crypto: CryptoInfo): Promise<string> => {
    // This would normally call an image generation API
    // For now, return a placeholder
    return `/placeholder.svg?height=600&width=800&text=${crypto.symbol}`
  }

  const createNewPost = async (crypto: CryptoInfo): Promise<Post> => {
    setIsGenerating(true)
    try {
      const [caption, imageUrl] = await Promise.all([
        generateSexyDescription(crypto),
        generateImage(crypto),
      ])

      return {
        id: generatePostId(),
        imageUrl,
        caption,
        crypto,
        timestamp: "Just now",
        likes: 0,
        comments: 0,
        shares: 0,
        username: `${crypto.name}Queen`,
        userHandle: `${crypto.symbol.toLowerCase()}_queen`,
        verified: true,
        avatarUrl: crypto.logo
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Generate 3 posts for the selected crypto
      const newPosts = await Promise.all([
        createNewPost(selectedCrypto),
        createNewPost(selectedCrypto),
        createNewPost(selectedCrypto),
      ])
      
      setPosts(prevPosts => [...newPosts, ...prevPosts])
      setPrompt("")
    } catch (error) {
      console.error("Failed to create posts:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
    // Also clean up the post from liked and bookmarked sets
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      newSet.delete(postId)
      return newSet
    })
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      newSet.delete(postId)
      return newSet
    })
  }

  const handleCustomCryptoSubmit = () => {
    if (!customCrypto.trim()) return
    
    const newCrypto: CryptoInfo = {
      name: customCrypto,
      symbol: customCrypto.toUpperCase(),
      logo: `/placeholder.svg?text=${customCrypto.toUpperCase()}`
    }
    setSelectedCrypto(newCrypto)
    setIsCustom(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
      <div className="max-w-[1400px] mx-auto p-4 flex gap-6">
        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">OnlyCoins</h1>
          <form onSubmit={handlePromptSubmit} className="mb-8">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-4 gap-3">
                {SUPPORTED_CRYPTOS.map((crypto) => (
                  <Button
                    key={crypto.symbol}
                    type="button"
                    variant={!isCustom && selectedCrypto.symbol === crypto.symbol ? "default" : "outline"}
                    className={`relative h-24 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 ${
                      !isCustom && selectedCrypto.symbol === crypto.symbol 
                        ? "bg-gradient-to-br from-pink-500 to-purple-600 border-none text-white shadow-lg shadow-pink-500/20"
                        : "bg-black/20 backdrop-blur-lg border-white/10 hover:border-pink-500/50 hover:bg-black/30"
                    }`}
                    onClick={() => {
                      setSelectedCrypto(crypto)
                      setIsCustom(false)
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 transition-opacity group-hover:opacity-30">
                      <Image
                        src={crypto.logo}
                        alt={crypto.name}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <span className="relative z-10 font-bold">{crypto.symbol}</span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Enter any other cryptocurrency..."
                  value={customCrypto}
                  onChange={(e) => setCustomCrypto(e.target.value)}
                  className="flex-1 h-10 bg-black/20 backdrop-blur-lg border-white/10 focus:border-pink-500/50 placeholder:text-white/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  className={`h-10 px-6 transition-all duration-300 ${
                    isCustom
                      ? "bg-gradient-to-br from-pink-500 to-purple-600 border-none text-white shadow-lg shadow-pink-500/20"
                      : "bg-black/20 backdrop-blur-lg border-white/10 hover:border-pink-500/50 hover:bg-black/30"
                  }`}
                  onClick={handleCustomCryptoSubmit}
                  disabled={!customCrypto.trim()}
                >
                  Add
                </Button>
              </div>
              <Button 
                onClick={handleGeneratePosts}
                disabled={isGenerating}
                className={`w-full h-12 transition-all duration-300 ${
                  isGenerating
                    ? "bg-black/20 backdrop-blur-lg"
                    : "bg-gradient-to-br from-pink-500 to-purple-600 hover:scale-[1.02] shadow-lg shadow-pink-500/20"
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                    <span>Generating posts...</span>
                  </div>
                ) : (
                  `Generate ${selectedCrypto.name} posts`
                )}
              </Button>
            </div>
          </form>
          {loading && (
            <div className="flex flex-col items-center justify-center mt-8">
              <Loader2 className="animate-spin h-10 w-10 text-pink-500 mb-2" />
              <p className="text-white/60">Fetching posts...</p>
            </div>
          )}
          {posts.length > 0 && (
            <div className="grid gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-6 rounded-xl bg-black/20 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 hover:border-pink-500/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-[2px]">
                      <div className="h-full w-full rounded-full overflow-hidden">
                        <Image
                          src={post.avatarUrl}
                          alt={post.username}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{post.username}</h3>
                        <span className="text-white/60">@{post.userHandle}</span>
                        {post.verified && (
                          <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubscribe(post.username, post)}
                          className={`ml-auto h-8 px-3 transition-colors ${
                            subscribedUsers.has(post.username)
                              ? "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {subscribedUsers.has(post.username) ? "Subscribed" : "Subscribe"}
                        </Button>
                      </div>
                      <p className="text-white/80 leading-relaxed mb-4">{post.caption}</p>
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-4 bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                        <Image
                          src={post.imageUrl}
                          alt={`${post.crypto.name} themed image`}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center justify-between text-white/60 text-sm">
                        <div className="flex items-center gap-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-2 transition-colors ${
                              likedPosts.has(post.id)
                                ? "text-pink-500"
                                : "text-white/60 hover:text-pink-500"
                            }`}
                            onClick={() => toggleLike(post.id)}
                          >
                            <Heart className={`h-5 w-5 transition-colors ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                            <span>{post.likes.toLocaleString()}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-white/60 hover:text-blue-400"
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments.toLocaleString()}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-white/60 hover:text-green-400"
                          >
                            <Repeat2 className="h-5 w-5" />
                            <span>{post.shares.toLocaleString()}</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`transition-colors ${
                            bookmarkedPosts.has(post.id)
                              ? "text-yellow-500"
                              : "text-white/60 hover:text-yellow-500"
                          }`}
                          onClick={() => toggleBookmark(post.id)}
                        >
                          <Bookmark className={`h-5 w-5 ${bookmarkedPosts.has(post.id) ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center text-white/60 mt-8 p-8 rounded-xl bg-black/20 backdrop-blur-lg border border-white/10">
              <p className="text-center mb-2">No posts found for this cryptocurrency</p>
              <p className="text-center text-sm">Try selecting a different category</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 hidden lg:block sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="rounded-xl bg-black/20 backdrop-blur-lg border border-white/10 p-4">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Collection</span>
              <span className="ml-auto text-sm text-white/60">{subscribedPosts.size}</span>
            </h2>
            <div className="space-y-4">
              {subscribedPosts.size === 0 ? (
                <div className="text-white/60 text-sm text-center py-8">
                  <p>No subscribed posts yet</p>
                  <p className="mt-1">Click subscribe button to save posts</p>
                </div>
              ) : (
                Array.from(subscribedPosts).map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-lg bg-black/20 border border-white/10 transition-all duration-300 hover:border-pink-500/20"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-[2px] flex-shrink-0">
                        <div className="h-full w-full rounded-full overflow-hidden">
                          <Image
                            src={post.avatarUrl}
                            alt={post.username}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="font-medium text-base truncate">{post.username}</p>
                          {post.verified && (
                            <svg className="w-4 h-4 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">@{post.userHandle}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-pink-500 hover:text-pink-600 -mr-2"
                        onClick={() => toggleSubscribe(post.username, post)}
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed mb-3">{post.caption}</p>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                      <Image
                        src={post.imageUrl}
                        alt={`${post.crypto.name} themed image`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
