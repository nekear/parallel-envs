"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getExperts, getSongs, getVotes, deleteExpert } from "@/lib/supabase"
import type { Expert, Song, Vote, VotingResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LogOut, UserPlus, UserX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"

export default function AdminPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [votingResults, setVotingResults] = useState<VotingResult[]>([])
  const [newExpertName, setNewExpertName] = useState("")
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { session, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!session?.user) {
      router.push("/")
      return
    }

    if (session.user.role !== "teacher") {
      router.push("/vote")
      return
    }

    const loadData = async () => {
      try {
        const [expertsData, songsData, votesData] = await Promise.all([getExperts(), getSongs(), getVotes()])

        setExperts(expertsData)
        setSongs(songsData)
        setVotes(votesData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [session, router, toast])

  const calculateResults = () => {
    const results: Map<string, VotingResult> = new Map()

    // Initialize results with all songs
    songs.forEach((song) => {
      results.set(song.id, {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        totalPoints: 0,
        voteCount: 0,
      })
    })

    // Calculate points (3 points for rank 1, 2 for rank 2, 1 for rank 3)
    votes.forEach((vote) => {
      const expert = experts.find((e) => e.id === vote.expert_id)
      if (expert && expert.role === "expert") {
        const song = results.get(vote.song_id)
        if (song) {
          // Points are inverse of rank (rank 1 = 3 points, rank 2 = 2 points, rank 3 = 1 point)
          const points = 4 - vote.rank
          results.set(vote.song_id, {
            ...song,
            totalPoints: song.totalPoints + points,
            voteCount: song.voteCount + 1,
          })
        }
      }
    })

    // Convert map to array and filter out songs with no votes
    const resultsArray = Array.from(results.values())
      .filter((result) => result.voteCount > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)

    setVotingResults(resultsArray)

    toast({
      title: "Success",
      description: "Voting results calculated successfully!",
    })
  }

  const handleAddExpert = async () => {
    if (!newExpertName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the new expert",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: newExpert } = await supabase
        .from("experts")
        .insert([{ name: newExpertName, role: "expert" }])
        .select()

      if (newExpert && newExpert.length > 0) {
        setExperts([...experts, newExpert[0]])
        setNewExpertName("")
        toast({
          title: "Success",
          description: `Expert "${newExpertName}" added successfully!`,
        })
      }
    } catch (error) {
      console.error("Error adding expert:", error)
      toast({
        title: "Error",
        description: "Failed to add expert. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExpert = async () => {
    if (!expertToDelete) return

    setIsSubmitting(true)

    try {
      await deleteExpert(expertToDelete.id)

      setExperts(experts.filter((e) => e.id !== expertToDelete.id))
      setVotes(votes.filter((v) => v.expert_id !== expertToDelete.id))
      setExpertToDelete(null)

      toast({
        title: "Success",
        description: `Expert "${expertToDelete.name}" deleted successfully!`,
      })
    } catch (error) {
      console.error("Error deleting expert:", error)
      toast({
        title: "Error",
        description: "Failed to delete expert. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Teacher Dashboard - {session?.user?.name}</h1>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="results" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Voting Results</TabsTrigger>
            <TabsTrigger value="experts">Expert Management</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Voting Results</CardTitle>
              </CardHeader>
              <CardContent>
                {votingResults.length > 0 ? (
                  <div className="space-y-4">
                    {votingResults.map((result, index) => (
                      <div key={result.songId} className="flex items-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold mr-4 w-8 text-center">#{index + 1}</div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{result.title}</h3>
                          <p className="text-gray-500">{result.artist}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{result.totalPoints} pts</p>
                          <p className="text-sm text-gray-500">{result.voteCount} votes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No voting results calculated yet.</p>
                )}

                <div className="mt-6">
                  <Button onClick={calculateResults}>Calculate Results</Button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total Experts</p>
                        <p className="text-3xl font-bold mt-1">{experts.filter((e) => e.role === "expert").length}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Votes Cast</p>
                        <p className="text-3xl font-bold mt-1">{new Set(votes.map((v) => v.expert_id)).size}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total Songs</p>
                        <p className="text-3xl font-bold mt-1">{songs.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Expert Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Add New Expert</h3>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="expert-name" className="sr-only">
                          Expert Name
                        </Label>
                        <Input
                          id="expert-name"
                          placeholder="Enter expert name"
                          value={newExpertName}
                          onChange={(e) => setNewExpertName(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button onClick={handleAddExpert} disabled={isSubmitting || !newExpertName.trim()}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Expert
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Current Experts</h3>
                    {experts.filter((e) => e.role === "expert").length === 0 ? (
                      <p className="text-gray-500">No experts found.</p>
                    ) : (
                      <div className="space-y-2">
                        {experts
                          .filter((e) => e.role === "expert")
                          .map((expert) => {
                            const hasVoted = votes.some((v) => v.expert_id === expert.id)
                            return (
                              <div key={expert.id} className="flex items-center justify-between p-3 border rounded-md">
                                <div>
                                  <p className="font-medium">{expert.name}</p>
                                  <p className="text-sm text-gray-500">{hasVoted ? "Has voted" : "Has not voted"}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setExpertToDelete(expert)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserX className="h-5 w-5" />
                                </Button>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!expertToDelete} onOpenChange={() => setExpertToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {expertToDelete?.name}? This action cannot be undone and will remove all
              their voting data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpert}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

