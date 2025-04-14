"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, ChevronDown, ChevronUp } from "lucide-react"
import type { AdvancedRankingResult, RankingMethod } from "@/types"
import RankingMatrixVisualization from "./RankingMatrixVisualization"
import ConsensusStatistics from "./ConsensusStatistics"

interface AdvancedRankingResultsProps {
    result: AdvancedRankingResult
}

const methodLabels: Record<RankingMethod, string> = {
    cookSayford: "Cook-Sayford",
    gv: "GV",
    kemenySnell: "Kemeny-Snell",
    vg: "VG",
}

const methodDescriptions: Record<RankingMethod, string> = {
    cookSayford:
        "Minimizes the sum of distances to all expert rankings. This method finds a consensus ranking that is, on average, closest to all expert rankings.",
    gv: "Minimizes the maximum distance to any expert ranking. This method ensures that no expert's ranking is too far from the consensus.",
    kemenySnell:
        "Minimizes the sum of Hamming distances to all expert rankings. This focuses on the number of pairwise disagreements between rankings.",
    vg: "Minimizes the maximum Hamming distance to any expert ranking. This ensures that no expert has too many pairwise disagreements with the consensus.",
}

export default function AdvancedRankingResults({ result }: AdvancedRankingResultsProps) {
    const [selectedMethod, setSelectedMethod] = useState<RankingMethod>("cookSayford")
    const [showDetails, setShowDetails] = useState(false)

    if (!result.medians) {
        return (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">Not enough data to calculate advanced rankings.</p>
            </div>
        )
    }

    // Get the first ranking for the selected method (there could be multiple optimal solutions)
    const selectedRanking = result.songRankings[selectedMethod][0] || []

    // Function to export results as CSV
    const exportResults = () => {
        // Create CSV content
        let csvContent = "Method,Position,Title,Artist,Genre\n"

        Object.entries(result.songRankings).forEach(([method, rankings]) => {
            if (rankings.length > 0) {
                rankings[0].forEach((song, index) => {
                    csvContent += `${method},${index + 1},"${song.title}","${song.artist}","${song.genre}"\n`
                })
            }
        })

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "advanced_ranking_results.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Advanced Ranking Results</h3>
                    <Button variant="outline" size="sm" onClick={exportResults}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Showing consensus rankings calculated using different median algorithms.
                </p>
            </div>

            <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as RankingMethod)}>
                {/*TODO: uncomment*/}
                {/*<TabsList className="grid grid-cols-4 mb-4">*/}
                {/*    {Object.entries(methodLabels).map(([method, label]) => (*/}
                {/*        <TabsTrigger key={method} value={method}>*/}
                {/*            {label}*/}
                {/*            <Badge variant="outline" className="ml-2 bg-primary/10">*/}
                {/*                {result.medians![method as RankingMethod].distance}*/}
                {/*            </Badge>*/}
                {/*        </TabsTrigger>*/}
                {/*    ))}*/}
                {/*</TabsList>*/}

                {Object.keys(methodLabels).map((method) => (
                    <TabsContent key={method} value={method} className="mt-0">
                        <Card className="p-4">

                            {/*TODO: uncomment*/}
                            {/*<div className="text-sm text-muted-foreground mb-4">*/}
                            {/*    <p>*/}
                            {/*        <span className="font-medium">{methodLabels[method as RankingMethod]} Median</span> - Distance:{" "}*/}
                            {/*        {result.medians![method as RankingMethod].distance}*/}
                            {/*    </p>*/}
                            {/*    <p className="mt-1">{methodDescriptions[method as RankingMethod]}</p>*/}
                            {/*</div>*/}

                            <div className="space-y-3">
                                {result.songRankings[method as RankingMethod][0]?.map((song, index) => (
                                    <div key={song.id} className="flex items-center p-3 border rounded-lg">
                                        <div className="text-2xl font-bold mr-4 w-8 text-center">#{index + 1}</div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-lg">{song.title}</h3>
                                            <p className="text-gray-500">{song.artist}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            <Button variant="outline" onClick={() => setShowDetails(!showDetails)} className="w-full">
                {showDetails ? (
                    <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Advanced Details
                    </>
                ) : (
                    <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Advanced Details
                    </>
                )}
            </Button>

            {showDetails && (
                <div className="space-y-6">
                    <RankingMatrixVisualization
                        matrix={result.rankingMatrix}
                        experts={result.filteredSongs.map((song, i) => ({
                            id: `expert-${i}`,
                            name: `Expert ${i + 1}`,
                            role: "expert",
                        }))}
                        songs={result.filteredSongs}
                        distances={result.distances}
                        referenceRanking={result.referenceRanking}
                    />

                    {/*TODO: uncomment*/}
                    {/*<ConsensusStatistics medians={result.medians} songs={result.filteredSongs} />*/}
                </div>
            )}

            <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-medium mb-2">About These Rankings</h4>
                <p className="text-sm text-muted-foreground">
                    These rankings represent consensus orderings calculated from all expert votes after applying the selected
                    heuristic. Each method uses a different approach to find the optimal ranking that best represents all expert
                    opinions.
                </p>
            </div>
        </div>
    )
}
