export interface Song {
    id: string
    title: string
    artist: string
    genre: string
}

export interface Vote {
    songId: string
    rank: number
}

export interface Expert {
    id: string
    name: string
    role: "expert" | "teacher"
    votes: Vote[]
    hasVoted: boolean
    selectedSongs: Song[] // Add selected songs to expert profile
}

export interface VotingResult {
    songId: string
    title: string
    artist: string
    totalPoints: number
    voteCount: number
}

