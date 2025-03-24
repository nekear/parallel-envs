import type { VotingResult } from "@/types"
import { Badge } from "@/components/ui/badge"

interface RankDistributionProps {
    result: VotingResult
}

export default function RankDistribution({ result }: RankDistributionProps) {
    if (!result.rankCounts) return null

    return (
        <div className="flex gap-2 mt-1">
            {result.rankCounts[1] > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                    1st: {result.rankCounts[1]}
                </Badge>
            )}
            {result.rankCounts[2] > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                    2nd: {result.rankCounts[2]}
                </Badge>
            )}
            {result.rankCounts[3] > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                    3rd: {result.rankCounts[3]}
                </Badge>
            )}
        </div>
    )
}

