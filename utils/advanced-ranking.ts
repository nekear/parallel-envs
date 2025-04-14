import type { Song, Vote, Expert, Heuristic, AdvancedRankingResult } from "@/types"
import { applyHeuristic } from "@/utils/heuristics"
import { RankingAlgorithm } from "@/utils/ranking-algorithm"

/**
 * Filter votes to keep only those that refer to post-heuristic songs.
 */
export function filterVotesForSongs(songs: Song[], votes: Vote[]): Vote[] {
    const songIds = new Set(songs.map((s) => s.id))
    return votes.filter((v) => songIds.has(v.song_id))
}

/**
 * Build a ranking matrix: each expert's row = their ranks for the filtered songs.
 */
export function buildRankingMatrix(filteredSongs: Song[], filteredVotes: Vote[], experts: Expert[]): number[][] {
    // Sort songs by ID for consistent ordering
    const sortedSongs = [...filteredSongs].sort((a, b) => a.id.localeCompare(b.id))
    const songIdToIndex = new Map(sortedSongs.map((song, index) => [song.id, index]))

    // Group votes by expert
    const votesByExpert = new Map<string, Map<string, number>>()

    for (const vote of filteredVotes) {
        if (!votesByExpert.has(vote.expert_id)) {
            votesByExpert.set(vote.expert_id, new Map())
        }
        votesByExpert.get(vote.expert_id)!.set(vote.song_id, vote.rank)
    }

    // For each expert who has voted, create a row of ranks
    const matrix: number[][] = []

    for (const expert of experts) {
        if (expert.role !== "expert") continue

        const expertVotes = votesByExpert.get(expert.id)
        if (!expertVotes || expertVotes.size === 0) continue

        const row: number[] = Array(sortedSongs.length).fill(0)

        for (const [songId, rank] of expertVotes.entries()) {
            const songIndex = songIdToIndex.get(songId)
            if (songIndex !== undefined) {
                row[songIndex] = rank
            }
        }

        // Only add experts who have ranked at least one song
        if (row.some((rank) => rank > 0)) {
            matrix.push(row)
        }
    }

    return matrix
}

/**
 * Generate a random reference ranking
 */
export function generateRandomRanking(length: number): number[] {
    const ranking = Array.from({ length }, (_, i) => i + 1)

    // Fisher-Yates shuffle
    for (let i = ranking.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[ranking[i], ranking[j]] = [ranking[j], ranking[i]]
    }

    return ranking
}

/**
 * Compute distances from a reference ranking to each expert's ranking
 */
export function computeDistances(referenceRanking: number[], expertRankings: number[][]): number[] {
    return expertRankings.map((ranking) => RankingAlgorithm.calculateCookDistance(referenceRanking, ranking))
}

/**
 * Process the advanced ranking workflow with performance optimization
 *
 * Note: For large datasets, we limit the number of songs to process to avoid
 * performance issues with permutation generation.
 */
export function processAdvancedRanking(
    songs: Song[],
    votes: Vote[],
    experts: Expert[],
    heuristic: Heuristic,
): AdvancedRankingResult {
    // 1. Apply heuristic to filter songs
    const filteredResults = applyHeuristic(votes, songs, heuristic)
    // Map the results back to the original Song objects
    const filteredSongs = filteredResults.map((result) => {
        return songs.find((song) => song.id === result.songId) as Song
    })

    // 2. Filter votes for the filtered songs
    const filteredVotes = filterVotesForSongs(filteredSongs, votes)

    // 3. Build the ranking matrix
    const rankingMatrix = buildRankingMatrix(filteredSongs, filteredVotes, experts)

    // Skip processing if we don't have enough data
    if (rankingMatrix.length === 0 || rankingMatrix[0].length === 0) {
        return {
            filteredSongs,
            rankingMatrix: [],
            referenceRanking: [],
            distances: [],
            medians: null,
            songRankings: {
                cookSayford: [],
                gv: [],
                kemenySnell: [],
                vg: [],
            },
        }
    }

    // Performance optimization: If we have too many songs, limit to top-ranked ones
    // because permutation generation grows factorially
    const MAX_SONGS_FOR_PERMUTATIONS = 7
    let processedMatrix = rankingMatrix
    let processedSongs = filteredSongs

    if (rankingMatrix[0].length > MAX_SONGS_FOR_PERMUTATIONS) {
        // If we have too many songs, we need to limit them to avoid performance issues
        console.warn(
            `Too many songs (${rankingMatrix[0].length}) for permutation calculation. Limiting to ${MAX_SONGS_FOR_PERMUTATIONS}.`,
        )

        // Create a score for each song based on its average rank
        const songScores = rankingMatrix[0].map((_, colIndex) => {
            const sum = rankingMatrix.reduce((acc, row) => acc + (row[colIndex] || 0), 0)
            return { index: colIndex, score: sum / rankingMatrix.length }
        })

        // Sort by score (lower is better) and take the top MAX_SONGS_FOR_PERMUTATIONS
        const topIndices = songScores
            .sort((a, b) => a.score - b.score)
            .slice(0, MAX_SONGS_FOR_PERMUTATIONS)
            .map((item) => item.index)
            .sort((a, b) => a - b) // Sort indices to maintain original order

        // Create a new matrix with only the top songs
        processedMatrix = rankingMatrix.map((row) => topIndices.map((index) => row[index]))

        // Create a new filtered songs array
        const sortedSongs = [...filteredSongs].sort((a, b) => a.id.localeCompare(b.id))
        processedSongs = topIndices.map((index) => sortedSongs[index])
    }

    // 4. Generate a random reference ranking
    const referenceRanking = generateRandomRanking(processedMatrix[0].length)

    // 5. Compute distances from reference to each expert
    const distances = computeDistances(referenceRanking, processedMatrix)

    // 6. Process the matrix with RankingAlgorithm
    const medians = RankingAlgorithm.processRankings(processedMatrix)

    // Map the numeric rankings back to songs
    const sortedSongs = [...processedSongs].sort((a, b) => a.id.localeCompare(b.id))

    const mapRankingsToSongs = (rankings: number[][]) => {
        return rankings.map((ranking) => {
            return ranking.map((rank, index) => {
                const songIndex = ranking.indexOf(index + 1)
                // Make sure we're returning Song objects
                return sortedSongs[songIndex]
            })
        })
    }

    const songRankings = {
        cookSayford: mapRankingsToSongs(medians.cookSayford.rankings),
        gv: mapRankingsToSongs(medians.gv.rankings),
        kemenySnell: mapRankingsToSongs(medians.kemenySnell.rankings),
        vg: mapRankingsToSongs(medians.vg.rankings),
    }

    return {
        filteredSongs,
        rankingMatrix,
        referenceRanking,
        distances,
        medians,
        songRankings,
    }
}
