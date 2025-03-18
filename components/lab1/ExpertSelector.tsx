"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, UserCog, User } from "lucide-react"
import type { Expert } from "../../types"

interface ExpertSelectorProps {
  experts: Expert[]
  activeExpert: number
  onExpertSelect: (index: number) => void
}

export default function ExpertSelector({ experts, activeExpert, onExpertSelect }: ExpertSelectorProps) {
  const [open, setOpen] = useState(false)
  const currentExpert = experts[activeExpert]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[220px] justify-between">
          <div className="flex items-center gap-2 truncate">
            {currentExpert.role === "teacher" ? (
              <UserCog className="h-4 w-4 text-amber-500" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="truncate">
              {currentExpert.name}
              {currentExpert.role === "teacher" ? " (Teacher)" : ""}
            </span>
            {currentExpert.hasVoted && currentExpert.role === "expert" && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {experts.map((expert, index) => (
          <DropdownMenuItem
            key={expert.id}
            className={`flex items-center justify-between ${
              index === activeExpert ? "bg-accent" : ""
            } ${expert.role === "teacher" ? "font-medium" : ""}`}
            onClick={() => {
              onExpertSelect(index)
              setOpen(false)
            }}
          >
            <div className="flex items-center gap-2 truncate">
              {expert.role === "teacher" ? (
                <UserCog className="h-4 w-4 text-amber-500" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="truncate">
                {expert.name}
                {expert.role === "teacher" ? " (Teacher)" : ""}
              </span>
            </div>
            {expert.hasVoted && expert.role === "expert" && <Check className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

