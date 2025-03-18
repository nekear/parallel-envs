"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Session } from "@/types"

interface AuthContextType {
  session: Session | null
  loading: boolean
  login: (name: string, isTeacher?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for session in localStorage
    const storedSession = localStorage.getItem("session")
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession))
      } catch (e) {
        console.error("Error parsing stored session:", e)
        localStorage.removeItem("session")
      }
    }
    setLoading(false)
  }, [])

  const login = async (name: string, isTeacher = false) => {
    setLoading(true)
    try {
      // Check if expert exists
      const { data: existingExperts } = await supabase.from("experts").select("*").eq("name", name).limit(1)

      let expertId: string

      if (existingExperts && existingExperts.length > 0) {
        expertId = existingExperts[0].id
      } else {
        // Create new expert
        const { data: newExpert } = await supabase
          .from("experts")
          .insert([{ name, role: isTeacher ? "teacher" : "expert" }])
          .select()

        if (!newExpert || newExpert.length === 0) {
          throw new Error("Failed to create expert")
        }

        expertId = newExpert[0].id
      }

      const newSession: Session = {
        user: {
          id: expertId,
          name,
          role: isTeacher ? "teacher" : "expert",
        },
      }

      setSession(newSession)
      localStorage.setItem("session", JSON.stringify(newSession))

      // Redirect based on role
      if (isTeacher) {
        router.push("/admin")
      } else {
        router.push("/vote")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setSession(null)
    localStorage.removeItem("session")
    router.push("/")
  }

  return <AuthContext.Provider value={{ session, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

