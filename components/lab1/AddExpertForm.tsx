"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

interface AddExpertFormProps {
  onAddExpert: (name: string) => void
}

export default function AddExpertForm({ onAddExpert }: AddExpertFormProps) {
  const [expertName, setExpertName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (expertName.trim()) {
      onAddExpert(expertName.trim())
      setExpertName("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expert-name">Expert Name</Label>
        <div className="flex gap-2">
          <Input
            id="expert-name"
            value={expertName}
            onChange={(e) => setExpertName(e.target.value)}
            placeholder="Enter expert name"
            className="flex-1"
          />
          <Button type="submit" disabled={!expertName.trim()}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Expert
          </Button>
        </div>
      </div>
    </form>
  )
}

