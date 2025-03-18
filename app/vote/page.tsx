"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getSongs, submitVotes } from "@/lib/supabase"
import type { Song } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, GripVertical, LogOut } from "lucide-react"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd"
import { useToast } from "@/components/ui/use-toast"

export default function VotePage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { session, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!session?.user) {
      router.push("/")
      return
    }

    if (session.user.role === "teacher") {
      router.push("/admin")
      return
    }

    const loadSongs = async () => {
      try {
        const songsData = await getSongs()
        setSongs(songsData)
      } catch (error) {
        console.error("Error loading songs:", error)
        toast({
          title: "Error",
          description: "Failed to load songs. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()
  }, [session, router, toast])

  const handleSongSelect = (song: Song) => {
    if (hasVoted) return

    if (selectedSongs.some((s) => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter((s) => s.id !== song.id))
    } else if (selectedSongs.length < 3) {
      setSelectedSongs([...selectedSongs, song])
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || hasVoted) return

    const items = Array.from(selectedSongs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedSongs(items)
  }

  const handleSubmitVotes = async () => {
    if (!session?.user || selectedSongs.length === 0 || hasVoted) return

    setIsSubmitting(true)

    try {
      const votes = selectedSongs.map((song, index) => ({
        song_id: song.id,
        rank: index + 1,
      }))

      await submitVotes(session.user.id, votes)

      setHasVoted(true)
      toast({
        title: "Success",
        description: "Your votes have been submitted successfully!",
      })
    } catch (error) {
      console.error("Error submitting votes:", error)
      toast({
        title: "Error",
        description: "Failed to submit votes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading songs...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, {session?.user?.name}</h1>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {hasVoted ? "Thank you for voting!" : "Select your top 3 songs"}
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-3">Your Selected Songs ({selectedSongs.length}/3)</h3>
              {selectedSongs.length === 0 ? (
                <p className="text-gray-500">Select up to 3 songs from the list below</p>
              ) : (
                <div className="space-y-2">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="selected-songs">
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-2 rounded-lg ${snapshot.isDraggingOver ? "bg-gray-100" : ""}`}
                        >
                          {selectedSongs.map((song, index) => (
                            <Draggable key={song.id} draggableId={song.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 transition-colors ${
                                    snapshot.isDragging ? "bg-gray-100 shadow-lg" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                      <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                                        {song.title}
                                      </div>
                                      <div className="text-sm text-gray-500">{song.artist}</div>
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <Button
                    className="w-full mt-4"
                    onClick={handleSubmitVotes}
                    disabled={selectedSongs.length === 0 || isSubmitting || hasVoted}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Votes"}
                  </Button>
                </div>
              )}
            </div>

            {hasVoted ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Thank you for your votes!</h3>
                <p className="text-green-700">Your votes have been recorded successfully.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {songs.map((song) => {
                  const isSelected = selectedSongs.some((s) => s.id === song.id)
                  return (
                    <Card
                      key={song.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSongSelect(song)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{song.title}</h3>
                          <p className="text-sm text-gray-500">{song.artist}</p>
                          <p className="text-xs text-gray-400 mt-1">{song.genre}</p>
                        </div>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

