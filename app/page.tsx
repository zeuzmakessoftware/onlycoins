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

// Add supported cryptocurrencies
const SUPPORTED_CRYPTOS = [
  { name: "Bitcoin", symbol: "BTC", logo: "/crypto-logos/btc.svg" },
  { name: "Ethereum", symbol: "ETH", logo: "/crypto-logos/eth.svg" },
  { name: "Dogecoin", symbol: "DOGE", logo: "/crypto-logos/doge.svg" },
  { name: "Solana", symbol: "SOL", logo: "/crypto-logos/sol.svg" },
  { name: "Cardano", symbol: "ADA", logo: "/crypto-logos/ada.svg" },
] as const

type CryptoInfo = typeof SUPPORTED_CRYPTOS[number]

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
  const [subscribedUsers, setSubscribedUsers] = useState<Set<string>>(new Set())
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoInfo>(SUPPORTED_CRYPTOS[0])
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const isMobile = useMobile()
  const [loading, setLoading] = useState(false)

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
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const toggleSubscribe = (username: string) => {
    setSubscribedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(username)) {
        newSet.delete(username)
      } else {
        newSet.add(username)
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">OnlyCoins</h1>
        <form onSubmit={handlePromptSubmit} className="mb-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-5 gap-2">
              {SUPPORTED_CRYPTOS.map((crypto) => (
                <Button
                  key={crypto.symbol}
                  type="button"
                  variant={selectedCrypto.symbol === crypto.symbol ? "default" : "outline"}
                  className="relative h-20 cursor-pointer"
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Image
                      src={crypto.logo}
                      alt={crypto.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="relative z-10">{crypto.symbol}</span>
                </Button>
              ))}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg cursor-pointer"
              disabled={isSubmitting || isGenerating}
              onClick={handleGeneratePosts}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Some Enticing {selectedCrypto.name} Posts...
                </>
              ) : (
                <>Generate {selectedCrypto.name} Posts</>
              )}
            </Button>
          </div>
        </form>
        {loading && (
          <div className="flex flex-col items-center justify-center mt-8">
            <Loader2 className="animate-spin h-10 w-10 text-white mb-2" />
            <p className="text-slate-400">Fetching posts...</p>
          </div>
        )}
        {posts.map((post) => (
          <Card key={post.id} className="bg-white/10 backdrop-blur-md border-none text-white mb-4 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar>
                    <AvatarImage src={post.avatarUrl} />
                    <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium">{post.username}</p>
                      {post.verified && (
                        <svg className="w-4 h-4 ml-1 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubscribe(post.username)}
                        className={`ml-2 h-7 px-2 ${
                          subscribedUsers.has(post.username)
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "hover:bg-white/10"
                        }`}
                      >
                        {subscribedUsers.has(post.username) ? "Subscribed" : "Subscribe"}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-400">@{post.userHandle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400">{post.timestamp}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                        <DropdownMenuItem className="cursor-pointer">Not interested</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Report post</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Copy link</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-400/10"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="mb-3 whitespace-pre-line">{post.caption}</p>

                <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-3">
                  <Image
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={`${post.crypto.name} themed image`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex items-center text-xs text-slate-400 mb-2">
                  <span>{post.likes.toLocaleString()} likes</span>
                  <span className="mx-1">•</span>
                  <span>{post.comments.toLocaleString()} comments</span>
                  <span className="mx-1">•</span>
                  <span>{post.shares.toLocaleString()} shares</span>
                </div>

                <Separator className="my-3 bg-white/20" />

                <div className="flex justify-between text-slate-300">
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "default"}
                    className={`flex items-center gap-1.5 ${likedPosts.has(post.id) ? "text-red-500" : "text-slate-300 hover:text-red-400"}`}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                    <span>Like</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "default"}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Comment</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "default"}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-green-400"
                  >
                    <Repeat2 className="h-5 w-5" />
                    <span>Repost</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "default"}
                    className={`flex items-center gap-1.5 ${bookmarkedPosts.has(post.id) ? "text-yellow-500" : "text-slate-300 hover:text-yellow-400"}`}
                    onClick={() => toggleBookmark(post.id)}
                  >
                    <Bookmark className={`h-5 w-5 ${bookmarkedPosts.has(post.id) ? "fill-current" : ""}`} />
                    <span>Save</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-slate-400 mt-8 p-8 bg-white/5 rounded-lg">
            <p className="text-center mb-2">No posts found for this cryptocurrency</p>
            <p className="text-center text-sm">Try selecting a different category</p>
          </div>
        )}
      </div>
    </main>
  )
}
