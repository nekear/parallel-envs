import { Card } from "@/components/ui/card"
import type { VotingResult } from "../../types"

interface VotingResultsProps {
  results: VotingResult[]
}

export default function VotingResults({ results }: VotingResultsProps) {
  const sortedResults = [...results].sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Voting Results</h2>

      {sortedResults.length === 0 ? (
        <p className="text-muted-foreground">No votes have been submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {sortedResults.map((result, index) => (
            <Card key={result.songId} className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-4 w-8">#{index + 1}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{result.title}</h3>
                  <p className="text-muted-foreground">{result.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{result.totalPoints} pts</p>
                  <p className="text-sm text-muted-foreground">{result.voteCount} votes</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

