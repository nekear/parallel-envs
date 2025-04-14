"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RankingMedians, Song } from "@/types"

interface ConsensusStatisticsProps {
    medians: RankingMedians
    songs: Song[]
}

export default function ConsensusStatistics({ medians, songs }: ConsensusStatisticsProps) {
    // Count how many times each song appears in the top positions across all median methods
    const songAppearances = new Map<string, { song: Song; counts: Record<number, number> }>()

    // Initialize the map with all songs
    songs.forEach((song) => {
        songAppearances.set(song.id, { song, counts: { 1: 0, 2: 0, 3: 0 } })
    })

    // Count appearances in each median method
    const methods = ["cookSayford", "gv", "kemenySnell", "vg"] as const

    methods.forEach((method) => {
        medians[method].rankings.forEach((ranking) => {
            // Only consider the top 3 positions
            for (let i = 0; i < Math.min(3, ranking.length); i++) {
                const position = i + 1
                const songIndex = ranking.indexOf(position)

                if (songIndex >= 0 && songIndex < songs.length) {
                    const songId = songs[songIndex].id
                    const songData = songAppearances.get(songId)

                    if (songData) {
                        songData.counts[position as 1 | 2 | 3] += 1
                    }
                }
            }
        })
    })

    // Calculate agreement between different median methods
    const agreementStats = {
        topPosition: 0,
        top3: 0,
        totalMethods: methods.length,
    }

    // Find songs that appear in the same position across methods
    const songsInTopPosition = new Set<string>()
    const songsInTop3 = new Set<string>()

    songAppearances.forEach((data, songId) => {
        // If a song appears in position 1 in all methods
        if (data.counts[1] === methods.length) {
            agreementStats.topPosition += 1
            songsInTopPosition.add(songId)
        }

        // If a song appears in top 3 in all methods
        const totalTop3 = data.counts[1] + data.counts[2] + data.counts[3]
        if (totalTop3 >= methods.length) {
            agreementStats.top3 += 1
            songsInTop3.add(songId)
        }
    })

    // Sort songs by their frequency in top positions
    const sortedSongs = Array.from(songAppearances.values())
        .sort((a, b) => {
            // First by position 1
            if (b.counts[1] !== a.counts[1]) return b.counts[1] - a.counts[1]
            // Then by position 2
            if (b.counts[2] !== a.counts[2]) return b.counts[2] - a.counts[2]
            // Then by position 3
            return b.counts[3] - a.counts[3]
        })
        .slice(0, 5) // Top 5 songs

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Consensus Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Method Agreement</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Top position agreement:</span>
                                    <Badge variant={agreementStats.topPosition > 0 ? "default" : "outline"}>
                                        {agreementStats.topPosition} / {methods.length} methods
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Top 3 agreement:</span>
                                    <Badge variant={agreementStats.top3 > 0 ? "secondary" : "outline"}>
                                        {agreementStats.top3} / {methods.length} methods
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Distance Statistics</h4>
                            <div className="space-y-2">
                                {methods.map((method) => (
                                    <div key={method} className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">{method}:</span>
                                        <Badge variant="outline">{medians[method].distance}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top Songs Across Methods</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sortedSongs.map(({ song, counts }) => (
                            <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">{song.title}</h4>
                                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                                </div>
                                <div className="flex gap-2">
                                    {counts[1] > 0 && (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                                            1st: {counts[1]}
                                        </Badge>
                                    )}
                                    {counts[2] > 0 && (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
                                            2nd: {counts[2]}
                                        </Badge>
                                    )}
                                    {counts[3] > 0 && (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                                            3rd: {counts[3]}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
