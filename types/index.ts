export interface Song {
  id: string
  title: string
  artist: string
  genre: string
  created_at?: string
}

export interface Expert {
  id: string
  name: string
  role: "expert" | "teacher"
  created_at?: string
}

export interface Vote {
  id: string
  expert_id: string
  song_id: string
  rank: number
  created_at?: string
}

export interface VotingResult {
  songId: string
  title: string
  artist: string
  totalPoints: number
  voteCount: number
  rankCounts?: {
    1: number
    2: number
    3: number
  }
}

export interface Session {
  user: {
    id: string
    name: string
    role: "expert" | "teacher"
  } | null
}

export type Heuristic =
    | "standard"
    | "h1" // Participation in a single multiple comparison in 3rd place
    | "h2" // Participation in a single multiple comparison in 2nd place
    | "h3" // Participation in a single multiple comparison in 1st place
    | "h4" // Participation in two multiple comparisons in 3rd place
    | "h5" // Participation in one comparison in 3rd place and another in 2nd place
    | "h6" // Object with the lowest total number of mentions across all comparisons
    | "h7" // Object that never appeared in the top 3 in any comparison

