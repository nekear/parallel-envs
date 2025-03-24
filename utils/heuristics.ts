import type { Song, Vote, VotingResult, Heuristic } from "@/types"

// Helper function to count ranks for each song
function countRanks(votes: Vote[], songs: Song[]) {
    const results = new Map<string, VotingResult>()

    // Initialize results with all songs
    songs.forEach((song) => {
        results.set(song.id, {
            songId: song.id,
            title: song.title,
            artist: song.artist,
            totalPoints: 0,
            voteCount: 0,
            rankCounts: {
                1: 0,
                2: 0,
                3: 0,
            },
        })
    })

    // Count votes and points
    votes.forEach((vote) => {
        const song = results.get(vote.song_id)
        if (song) {
            // Points are inverse of rank (rank 1 = 3 points, rank 2 = 2 points, rank 3 = 1 point)
            const points = 4 - vote.rank
            const updatedSong = {
                ...song,
                totalPoints: song.totalPoints + points,
                voteCount: song.voteCount + 1,
            }

            // Update rank counts
            if (song.rankCounts) {
                updatedSong.rankCounts = {
                    ...song.rankCounts,
                    [vote.rank]: song.rankCounts[vote.rank as 1 | 2 | 3] + 1,
                }
            }

            results.set(vote.song_id, updatedSong)
        }
    })

    return Array.from(results.values())
}

// Apply heuristic to results
export function applyHeuristic(votes: Vote[], songs: Song[], heuristic: Heuristic): VotingResult[] {
    const results = countRanks(votes, songs)

    // Filter songs with no votes for most heuristics
    const votedSongs = results.filter((song) => song.voteCount > 0)

    switch (heuristic) {
        case "standard":
            // Standard ranking by total points
            return votedSongs.sort((a, b) => b.totalPoints - a.totalPoints)

        case "h1":
            // Songs ranked in 3rd place at least once
            return votedSongs
                .filter((song) => song.rankCounts && song.rankCounts[3] > 0)
                .sort((a, b) => b.rankCounts![3] - a.rankCounts![3])

        case "h2":
            // Songs ranked in 2nd place at least once
            return votedSongs
                .filter((song) => song.rankCounts && song.rankCounts[2] > 0)
                .sort((a, b) => b.rankCounts![2] - a.rankCounts![2])

        case "h3":
            // Songs ranked in 1st place at least once
            return votedSongs
                .filter((song) => song.rankCounts && song.rankCounts[1] > 0)
                .sort((a, b) => b.rankCounts![1] - a.rankCounts![1])

        case "h4":
            // Songs ranked in 3rd place at least twice
            return votedSongs
                .filter((song) => song.rankCounts && song.rankCounts[3] >= 2)
                .sort((a, b) => b.rankCounts![3] - a.rankCounts![3])

        case "h5":
            // Songs ranked in 3rd place once and 2nd place in another
            return votedSongs
                .filter((song) => song.rankCounts && song.rankCounts[3] > 0 && song.rankCounts[2] > 0)
                .sort((a, b) => {
                    // Sort by combined count of 2nd and 3rd place mentions
                    const aCount = a.rankCounts![2] + a.rankCounts![3]
                    const bCount = b.rankCounts![2] + b.rankCounts![3]
                    return bCount - aCount
                })

        case "h6":
            // Songs with lowest total mentions (voteCount)
            return votedSongs.sort((a, b) => a.voteCount - b.voteCount)

        case "h7":
            // Songs that never appeared in top 3
            // Since we're only tracking votes that are in top 3, we need to find songs with no votes
            return results.filter((song) => song.voteCount === 0).sort((a, b) => a.title.localeCompare(b.title))

        default:
            return votedSongs.sort((a, b) => b.totalPoints - a.totalPoints)
    }
}

