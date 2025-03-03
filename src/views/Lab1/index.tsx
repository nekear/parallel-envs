"use client"

import {useState} from "react"
import {v4 as uuidv4} from "uuid"
import type {Expert, Song, Vote, VotingResult} from "./types"
import SongSelector from "./components/SongSelector"
import MainNavigation from "./components/MainNavigation"
import TeacherDashboard from "./components/TeacherDashboard"
import {Card} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

// Create a database of 20 songs
const songDatabase: Song[] = [
    {id: uuidv4(), title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock"},
    {id: uuidv4(), title: "Billie Jean", artist: "Michael Jackson", genre: "Pop"},
    {id: uuidv4(), title: "Hotel California", artist: "Eagles", genre: "Rock"},
    {id: uuidv4(), title: "Imagine", artist: "John Lennon", genre: "Rock"},
    {id: uuidv4(), title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Rock"},
    {id: uuidv4(), title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge"},
    {id: uuidv4(), title: "Purple Haze", artist: "Jimi Hendrix", genre: "Rock"},
    {id: uuidv4(), title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock"},
    {id: uuidv4(), title: "Like a Rolling Stone", artist: "Bob Dylan", genre: "Folk Rock"},
    {id: uuidv4(), title: "Thriller", artist: "Michael Jackson", genre: "Pop"},
    {id: uuidv4(), title: "Respect", artist: "Aretha Franklin", genre: "Soul"},
    {id: uuidv4(), title: "Johnny B. Goode", artist: "Chuck Berry", genre: "Rock and Roll"},
    {id: uuidv4(), title: "Good Vibrations", artist: "The Beach Boys", genre: "Pop"},
    {id: uuidv4(), title: "Hey Jude", artist: "The Beatles", genre: "Rock"},
    {id: uuidv4(), title: "Superstition", artist: "Stevie Wonder", genre: "Funk"},
    {id: uuidv4(), title: "What's Going On", artist: "Marvin Gaye", genre: "Soul"},
    {id: uuidv4(), title: "Waterloo Sunset", artist: "The Kinks", genre: "Rock"},
    {id: uuidv4(), title: "London Calling", artist: "The Clash", genre: "Punk"},
    {id: uuidv4(), title: "Dancing Queen", artist: "ABBA", genre: "Pop"},
    {id: uuidv4(), title: "I Want to Hold Your Hand", artist: "The Beatles", genre: "Rock"},
]

// Update initialExperts to include selectedSongs
const initialExperts: Expert[] = [
    {id: uuidv4(), name: "John", role: "expert", votes: [], hasVoted: false, selectedSongs: []},
    {id: uuidv4(), name: "Sarah", role: "expert", votes: [], hasVoted: false, selectedSongs: []},
    {id: uuidv4(), name: "Michael", role: "expert", votes: [], hasVoted: false, selectedSongs: []},
    {id: uuidv4(), name: "Professor Smith", role: "teacher", votes: [], hasVoted: false, selectedSongs: []},
]

export default function Lab1() {
    const [view, setView] = useState<"teacher" | "experts">("experts")
    const [experts, setExperts] = useState<Expert[]>(initialExperts)
    const [activeExpert, setActiveExpert] = useState<number>(0)
    const [votingResults, setVotingResults] = useState<VotingResult[]>([])

    // Helper to get the active expert
    const currentExpert = experts[activeExpert]

    // Helper to add a log entry
    const addLog = (message: string) => {
        console.log(`${new Date().toLocaleString()}: ${message}`);
    }

    // Handle song selection
    const handleSongSelect = (song: Song) => {
        if (currentExpert.role === "teacher") return
        if (currentExpert.hasVoted) return

        setExperts((prevExperts) =>
            prevExperts.map((expert, index) => {
                if (index !== activeExpert) return expert

                const isSelected = expert.selectedSongs.some((s) => s.id === song.id)
                let newSelectedSongs: Song[]

                if (isSelected) {
                    newSelectedSongs = expert.selectedSongs.filter((s) => s.id !== song.id)
                } else if (expert.selectedSongs.length < 3) {
                    newSelectedSongs = [...expert.selectedSongs, song]
                } else {
                    return expert
                }

                return {
                    ...expert,
                    selectedSongs: newSelectedSongs,
                }
            }),
        )
    }

    // Handle song reordering
    const handleSongsReorder = (reorderedSongs: Song[]) => {
        if (currentExpert.role === "teacher") return
        if (currentExpert.hasVoted) return

        setExperts((prevExperts) =>
            prevExperts.map((expert, index) =>
                index === activeExpert ? {...expert, selectedSongs: reorderedSongs} : expert,
            ),
        )
    }

    // Handle vote submission
    const handleVoteSubmit = (votes: Vote[]) => {
        if (currentExpert.role === "teacher") {
            addLog("Teachers cannot vote!")
            return
        }

        if (currentExpert.hasVoted) {
            addLog(`${currentExpert.name} has already voted!`)
            return
        }

        setExperts((prevExperts) =>
            prevExperts.map((expert, index) =>
                index === activeExpert ? {...expert, votes, hasVoted: true, selectedSongs: []} : expert,
            ),
        )

        addLog(`${currentExpert.name} submitted votes for ${votes.length} songs.`)
    }

    // Calculate voting results
    const calculateResults = () => {
        const results: Map<string, VotingResult> = new Map()

        // Initialize results with all songs
        songDatabase.forEach((song) => {
            results.set(song.id, {
                songId: song.id,
                title: song.title,
                artist: song.artist,
                totalPoints: 0,
                voteCount: 0,
            })
        })

        // Calculate points (3 points for rank 1, 2 for rank 2, 1 for rank 3)
        experts.forEach((expert) => {
            if (expert.role === "expert" && expert.hasVoted) {
                expert.votes.forEach((vote) => {
                    const song = results.get(vote.songId)
                    if (song) {
                        // Points are inverse of rank (rank 1 = 3 points, rank 2 = 2 points, rank 3 = 1 point)
                        const points = 4 - vote.rank
                        results.set(vote.songId, {
                            ...song,
                            totalPoints: song.totalPoints + points,
                            voteCount: song.voteCount + 1,
                        })
                    }
                })
            }
        })

        // Convert map to array and filter out songs with no votes
        const resultsArray = Array.from(results.values()).filter((result) => result.voteCount > 0)

        setVotingResults(resultsArray)
        addLog("Voting results calculated.")
    }

    // Reset all votes
    const resetVotes = () => {
        setExperts((prevExperts) =>
            prevExperts.map((expert) => ({
                ...expert,
                votes: [],
                hasVoted: false,
                selectedSongs: [], // Clear selections when resetting
            })),
        )
        setVotingResults([])
        addLog("All votes have been reset.")
    }

    const addExpert = (name: string) => {
        const newExpert: Expert = {
            id: uuidv4(),
            name,
            role: "expert",
            votes: [],
            hasVoted: false,
            selectedSongs: [], // Initialize empty selections
        }

        setExperts([...experts, newExpert])
        addLog(`Added new expert "${name}".`)
    }

    const deleteExpert = (expertId: string) => {
        const expert = experts.find((e) => e.id === expertId)
        if (expert) {
            setExperts((prevExperts) => prevExperts.filter((e) => e.id !== expertId))
            addLog(`Deleted expert "${expert.name}".`)

            // Reset active expert if needed
            if (experts[activeExpert].id === expertId) {
                const remainingExperts = experts.filter((e) => e.id !== expertId)
                const nextExpert = remainingExperts.findIndex((e) => e.role === "expert")
                setActiveExpert(nextExpert >= 0 ? nextExpert : 0)
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <MainNavigation view={view} onViewChange={setView}/>

            {view === "teacher" ? (
                <TeacherDashboard
                    experts={experts}
                    votingResults={votingResults}
                    onCalculateResults={calculateResults}
                    onResetVotes={resetVotes}
                    onAddExpert={addExpert}
                    onDeleteExpert={deleteExpert}
                />
            ) : (
                <div className="container mx-auto p-6">
                    <Card className="p-6 mb-6">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-semibold">Select Expert:</h2>
                            <Select
                                value={activeExpert.toString()}
                                onValueChange={(value) => setActiveExpert(Number.parseInt(value))}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select an expert"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {experts
                                        .filter((expert) => expert.role === "expert")
                                        .map((expert, index) => (
                                            <SelectItem key={expert.id} value={index.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{expert.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                            {expert.hasVoted
                                ? "(Voted)"
                                : expert.selectedSongs.length > 0
                                    ? `(${expert.selectedSongs.length} selected)`
                                    : ""}
                          </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>

                    <SongSelector
                        songs={songDatabase}
                        selectedSongs={currentExpert.selectedSongs}
                        onSongSelect={handleSongSelect}
                        onSongsReorder={handleSongsReorder}
                        onVoteSubmit={handleVoteSubmit}
                        disabled={currentExpert.hasVoted}
                    />
                </div>
            )}
        </div>
    )
}

