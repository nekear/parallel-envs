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
}

export interface Session {
  user: {
    id: string
    name: string
    role: "expert" | "teacher"
  } | null
}

