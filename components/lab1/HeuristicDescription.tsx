import type { Heuristic } from "@/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface HeuristicDescriptionProps {
    heuristic: Heuristic
}

export default function HeuristicDescription({ heuristic }: HeuristicDescriptionProps) {
    if (heuristic === "standard") return null

    const descriptions: Record<Heuristic, { title: string; description: string }> = {
        standard: {
            title: "Standard Ranking",
            description: "Ranks songs by total points (3 points for 1st place, 2 for 2nd, 1 for 3rd)",
        },
        h1: {
            title: "Third Place Mentions (H1)",
            description:
                "This heuristic highlights songs that were ranked in 3rd place in at least one vote. It can help identify songs that are consistently considered good but not necessarily the best.",
        },
        h2: {
            title: "Second Place Mentions (H2)",
            description:
                "This heuristic highlights songs that were ranked in 2nd place in at least one vote. It can help identify songs that are highly regarded but just missed the top spot.",
        },
        h3: {
            title: "First Place Mentions (H3)",
            description:
                "This heuristic highlights songs that were ranked in 1st place in at least one vote. It can help identify songs that at least one expert considered to be the best.",
        },
        h4: {
            title: "Multiple Third Place Mentions (H4)",
            description:
                "This heuristic highlights songs that were ranked in 3rd place in at least two votes. It can help identify songs that are consistently considered good across multiple experts.",
        },
        h5: {
            title: "Third and Second Place Mentions (H5)",
            description:
                "This heuristic highlights songs that were ranked in 3rd place in one vote and 2nd place in another. It can help identify songs with consistent mid-tier rankings.",
        },
        h6: {
            title: "Lowest Mention Count (H6)",
            description:
                "This heuristic ranks songs by the lowest total number of mentions across all votes. It can help identify songs that are rarely selected but might be worth consideration.",
        },
        h7: {
            title: "Never in Top 3 (H7)",
            description:
                "This heuristic shows songs that never appeared in the top 3 in any vote. It can help identify songs that might be overlooked but could have potential.",
        },
    }

    const { title, description } = descriptions[heuristic]

    return (
        <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
        </Alert>
    )
}

