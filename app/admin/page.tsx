"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getExperts, getSongs, getVotes, deleteExpert } from "@/lib/supabase"
import type { Expert, Song, Vote, VotingResult, Heuristic, AdvancedRankingResult } from "@/types"
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
import {LogOut, UserPlus, UserX, Calculator, Loader2} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import HeuristicSelector from "@/components/lab1/HeuristicSelector"
import { applyHeuristic } from "@/utils/heuristics"
import RankDistribution from "@/components/lab1/RankDistribution"
import HeuristicDescription from "@/components/lab1/HeuristicDescription"
import { processAdvancedRanking } from "@/utils/advanced-ranking"
import AdvancedRankingResults from "@/components/lab1/AdvancedRankingResults"

export default function AdminPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [votingResults, setVotingResults] = useState<VotingResult[]>([])
  const [newExpertName, setNewExpertName] = useState("")
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const { session, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedHeuristic, setSelectedHeuristic] = useState<Heuristic>("standard")
  const [advancedRankingResult, setAdvancedRankingResult] = useState<AdvancedRankingResult | null>(null)
  const [showAdvancedRanking, setShowAdvancedRanking] = useState(false)

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
    setVotingResults(applyHeuristic(votes, songs, selectedHeuristic))
    setShowAdvancedRanking(false)
    setAdvancedRankingResult(null)

    toast({
      title: "Success",
      description: `Voting results calculated using ${selectedHeuristic} heuristic!`,
    })
  }

  const calculateAdvancedRanking = async () => {
    setIsCalculating(true)

    try {
      // Use setTimeout to allow UI to update before heavy computation
      setTimeout(() => {
        const result = processAdvancedRanking(songs, votes, experts, selectedHeuristic)
        setAdvancedRankingResult(result)
        setShowAdvancedRanking(true)

        setIsCalculating(false)

        toast({
          title: "Success",
          description: "Advanced ranking calculations completed!",
        })
      }, 100)
    } catch (error) {
      console.error("Error calculating advanced rankings:", error)
      setIsCalculating(false)

      toast({
        title: "Error",
        description: "Failed to calculate advanced rankings. Please try again.",
        variant: "destructive",
      })
    }
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
                  <CardTitle>
                    Voting Results
                    {votingResults.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                      using{" "}
                          {selectedHeuristic === "standard"
                              ? "standard ranking"
                              : `heuristic ${selectedHeuristic.toUpperCase()}`}
                    </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCalculating ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium">Calculating Advanced Rankings...</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          This may take a moment for complex calculations.
                        </p>
                      </div>
                  ) : showAdvancedRanking && advancedRankingResult ? (
                      <AdvancedRankingResults result={advancedRankingResult} />
                  ) : votingResults.length > 0 ? (
                      <div className="space-y-4">
                        {votingResults.map((result, index) => (
                            <div key={result.songId} className="flex items-center p-4 border rounded-lg">
                              <div className="text-2xl font-bold mr-4 w-8 text-center">#{index + 1}</div>
                              <div className="flex-1">
                                <h3 className="font-medium text-lg">{result.title}</h3>
                                <p className="text-gray-500">{result.artist}</p>
                                <RankDistribution result={result} />
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

                  {/* Add the HeuristicSelector component to the UI */}
                  <div className="mb-6 border-t pt-6 mt-6">
                    <HeuristicSelector
                        selectedHeuristic={selectedHeuristic}
                        onChange={(heuristic) => {
                          setSelectedHeuristic(heuristic)
                          // Recalculate results when heuristic changes if we already have results
                          if (votingResults.length > 0) {
                            setVotingResults(applyHeuristic(votes, songs, heuristic))
                            setShowAdvancedRanking(false)
                            setAdvancedRankingResult(null)
                          }
                        }}
                    />
                    <HeuristicDescription heuristic={selectedHeuristic} />
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button onClick={calculateResults} disabled={isCalculating}>
                      Calculate Results
                    </Button>
                    {votingResults.length > 0 && (
                        <Button variant="outline" onClick={calculateAdvancedRanking} disabled={isCalculating}>
                          {isCalculating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Calculating...
                              </>
                          ) : (
                              <>
                                <Calculator className="h-4 w-4 mr-2" />
                                Advanced Ranking
                              </>
                          )}
                        </Button>
                    )}
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
