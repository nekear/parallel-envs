import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Expert, VotingResult } from "../types"
import VotingResults from "./VotingResults"
import AddExpertForm from "./AddExpertForm"
import { Trash2, UserX } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface TeacherDashboardProps {
  experts: Expert[]
  votingResults: VotingResult[]
  onCalculateResults: () => void
  onResetVotes: () => void
  onAddExpert: (name: string) => void
  onDeleteExpert: (expertId: string) => void
}

export default function TeacherDashboard({
  experts,
  votingResults,
  onCalculateResults,
  onResetVotes,
  onAddExpert,
  onDeleteExpert,
}: TeacherDashboardProps) {
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null)

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Voting Results</h2>
          <VotingResults results={votingResults} />
          <div className="mt-6 space-x-4">
            <Button onClick={onCalculateResults}>Calculate Results</Button>
            <Button variant="outline" onClick={onResetVotes}>
              Reset All Votes
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Expert Management</h2>
            <div className="space-y-4">
              <AddExpertForm onAddExpert={onAddExpert} />

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Current Experts</h3>
                <div className="space-y-2">
                  {experts
                    .filter((e) => e.role === "expert")
                    .map((expert) => (
                      <div
                        key={expert.id}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{expert.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {expert.hasVoted ? "Has voted" : "Has not voted"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpertToDelete(expert)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <UserX className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Voting Statistics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Experts</p>
                  <p className="text-2xl font-bold">{experts.filter((e) => e.role === "expert").length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Votes Cast</p>
                  <p className="text-2xl font-bold">
                    {experts.filter((e) => e.role === "expert" && e.hasVoted).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!expertToDelete} onOpenChange={() => setExpertToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expert Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {expertToDelete?.name}'s profile? This action cannot be undone and will
              remove all their voting data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expertToDelete) {
                  onDeleteExpert(expertToDelete.id)
                  setExpertToDelete(null)
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Expert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

