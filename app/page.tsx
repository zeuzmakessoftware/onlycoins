"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Repeat2 } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockPosts } from "@/lib/mock-data"
import { useMobile } from "@/hooks/use-mobile"

type Post = {
  id: string
  imageUrl: string
  caption: string
  crypto: string
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
  const isMobile = useMobile()

  useEffect(() => {
    // Initialize with mock data
    setPosts(mockPosts)
  }, [])

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">OnlyCoins</h1>        
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="mb-3 whitespace-pre-line">{post.caption}</p>

                <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-3">
                  <Image
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={`${post.crypto} themed image`}
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

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-slate-400 mt-8 p-8 bg-white/5 rounded-lg">
            <p className="text-center mb-2">No posts found for this cryptocurrency</p>
            <p className="text-center text-sm">Try selecting a different category</p>
          </div>
        )}
      </div>
    </main>
  )
}
