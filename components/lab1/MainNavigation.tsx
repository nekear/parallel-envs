import { Button } from "@/components/ui/button"
import { UserCog, Users } from "lucide-react"

interface MainNavigationProps {
  view: "teacher" | "experts"
  onViewChange: (view: "teacher" | "experts") => void
}

export default function MainNavigation({ view, onViewChange }: MainNavigationProps) {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Button variant={view === "experts" ? "default" : "outline"} onClick={() => onViewChange("experts")}>
            <Users className="mr-2 h-4 w-4" />
            Expert Panel
          </Button>
          <Button variant={view === "teacher" ? "default" : "outline"} onClick={() => onViewChange("teacher")}>
            <UserCog className="mr-2 h-4 w-4" />
            Teacher Panel
          </Button>
        </div>
      </div>
    </div>
  )
}

