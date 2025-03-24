"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Heuristic } from "@/types"

interface HeuristicSelectorProps {
    selectedHeuristic: Heuristic
    onChange: (heuristic: Heuristic) => void
}

export default function HeuristicSelector({ selectedHeuristic, onChange }: HeuristicSelectorProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Ranking Heuristic</h3>
            <RadioGroup value={selectedHeuristic} onValueChange={(value) => onChange(value as Heuristic)}>
                <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <div className="grid gap-1">
                            <Label htmlFor="standard" className="font-medium">
                                Standard Ranking
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Ranks songs by total points (3 points for 1st place, 2 for 2nd, 1 for 3rd)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h1" id="h1" />
                        <div className="grid gap-1">
                            <Label htmlFor="h1" className="font-medium">
                                H1 - Third Place Mentions
                            </Label>
                            <p className="text-sm text-muted-foreground">Songs that were ranked in 3rd place in at least one vote</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h2" id="h2" />
                        <div className="grid gap-1">
                            <Label htmlFor="h2" className="font-medium">
                                H2 - Second Place Mentions
                            </Label>
                            <p className="text-sm text-muted-foreground">Songs that were ranked in 2nd place in at least one vote</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h3" id="h3" />
                        <div className="grid gap-1">
                            <Label htmlFor="h3" className="font-medium">
                                H3 - First Place Mentions
                            </Label>
                            <p className="text-sm text-muted-foreground">Songs that were ranked in 1st place in at least one vote</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h4" id="h4" />
                        <div className="grid gap-1">
                            <Label htmlFor="h4" className="font-medium">
                                H4 - Multiple Third Place Mentions
                            </Label>
                            <p className="text-sm text-muted-foreground">Songs that were ranked in 3rd place in at least two votes</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h5" id="h5" />
                        <div className="grid gap-1">
                            <Label htmlFor="h5" className="font-medium">
                                H5 - Third and Second Place Mentions
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Songs ranked in 3rd place in one vote and 2nd place in another
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h6" id="h6" />
                        <div className="grid gap-1">
                            <Label htmlFor="h6" className="font-medium">
                                H6 - Lowest Mention Count
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Songs with the lowest total number of mentions across all votes
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <RadioGroupItem value="h7" id="h7" />
                        <div className="grid gap-1">
                            <Label htmlFor="h7" className="font-medium">
                                H7 - Never in Top 3
                            </Label>
                            <p className="text-sm text-muted-foreground">Songs that never appeared in the top 3 in any vote</p>
                        </div>
                    </div>
                </div>
            </RadioGroup>
        </div>
    )
}

