"use client"

import {useState} from "react"
import {Card} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {HelpCircle} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import type {Expert, Song} from "@/types"

interface RankingMatrixVisualizationProps {
    matrix: number[][]
    experts: Expert[]
    songs: Song[]
    distances: number[]
    referenceRanking: number[]
}

export default function RankingMatrixVisualization({
                                                       matrix,
                                                       experts,
                                                       songs,
                                                       distances,
                                                       referenceRanking,
                                                   }: RankingMatrixVisualizationProps) {
    const [view, setView] = useState<"matrix" | "distances">("matrix")

    // Filter to only include experts who have voted
    const votingExperts = experts
        .filter((expert) => expert.role === "expert" && matrix.length > 0)
        .slice(0, matrix.length)

    // Sort songs by ID for consistent ordering
    const sortedSongs = [...songs].sort((a, b) => a.id.localeCompare(b.id))
    const maxDistance = Math.max(...distances)

    const satToColor = (sat: number): string => {
        // 100 -> 120deg (green),  0 -> 0deg (red)
        const hue = (sat / 100) * 120
        return `hsl(${hue} 80% 45%)`
    }

    return (
        <Card className="p-4">
            <Tabs value={view} onValueChange={(value) => setView(value as "matrix" | "distances")}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Ranking Data Visualization</h3>
                    <TabsList>
                        <TabsTrigger value="matrix">Ranking Matrix</TabsTrigger>
                        <TabsTrigger value="distances">Reference Distances</TabsTrigger>
                    </TabsList>
                </div>

                {/* ==================== MATRIX VIEW ==================== */}
                <TabsContent value="matrix" className="mt-0">
                    <div className="text-sm text-muted-foreground mb-4">
                        <p>
                            This matrix shows each expert's ranking of the filtered songs. Each row represents an
                            expert,
                            and each column represents a song. The numbers indicate the rank assigned to each song (1 =
                            highest).
                        </p>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Expert</TableHead>
                                    {sortedSongs.map((song) => (
                                        <TableHead key={song.id} className="min-w-[120px]">
                                            <div className="truncate max-w-[120px]"
                                                 title={`${song.title} - ${song.artist}`}>
                                                {song.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {matrix.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell className="font-medium">
                                            {votingExperts[rowIndex]?.name || `Expert ${rowIndex + 1}`}
                                        </TableCell>
                                        {row.map((rank, colIndex) => (
                                            <TableCell key={colIndex} className="text-center">
                                                {rank > 0 ? (
                                                    <Badge
                                                        variant={rank === 1 ? "default" : rank === 2 ? "secondary" : "outline"}>
                                                        {rank}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* ==================== DISTANCES VIEW ==================== */}
                <TabsContent value="distances" className="mt-0">
                    <div className="text-sm text-muted-foreground mb-4">
                        <p className="flex items-center gap-2">
                            Reference Ranking:
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-[250px]">
                                            The final or random ranking used to compute distances to each expert's
                                            ranking.
                                            This helps visualize how different each expert's ranking is.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </p>
                        <div className="flex gap-2 mt-2">
                            {referenceRanking.map((rank, index) => (
                                <Badge key={index} variant="outline">
                                    {rank}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Expert</TableHead>
                                    <TableHead>Satisfaction</TableHead>
                                    <TableHead>Visualization</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {distances.map((distance, index) => {
                                    const satisfaction =
                                        maxDistance === 0 ? 100 : Math.round((1 - distance / maxDistance) * 100)

                                    const barWidth = maxDistance === 0 ? 100 : (distance / maxDistance) * 100
                                    const barColor = satToColor(100)

                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {votingExperts[index]?.name || `Expert ${index + 1}`}
                                            </TableCell>
                                            <TableCell>
                                                {(100 - satisfaction).toFixed(1)}%
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-full bg-gray-200/70 rounded-full h-2.5">
                                                    <div
                                                        className="h-2.5 rounded-full transition-all"
                                                        style={{
                                                            width: `${barWidth}%`,
                                                            backgroundColor: barColor,
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
    )
}
