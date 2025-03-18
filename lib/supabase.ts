import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getSongs() {
  const { data, error } = await supabase.from("songs").select("*").order("title")

  if (error) {
    console.error("Error fetching songs:", error)
    return []
  }

  return data || []
}

export async function getExperts() {
  const { data, error } = await supabase.from("experts").select("*").order("name")

  if (error) {
    console.error("Error fetching experts:", error)
    return []
  }

  return data || []
}

export async function getVotes() {
  const { data, error } = await supabase.from("votes").select("*")

  if (error) {
    console.error("Error fetching votes:", error)
    return []
  }

  return data || []
}

export async function createExpert(name: string, role: "expert" | "teacher" = "expert") {
  const { data, error } = await supabase.from("experts").insert([{ name, role }]).select()

  if (error) {
    console.error("Error creating expert:", error)
    throw error
  }

  return data?.[0]
}

export async function submitVotes(expertId: string, votes: { song_id: string; rank: number }[]) {
  // First, delete any existing votes from this expert
  const { error: deleteError } = await supabase.from("votes").delete().eq("expert_id", expertId)

  if (deleteError) {
    console.error("Error deleting existing votes:", deleteError)
    throw deleteError
  }

  // Then insert the new votes
  const votesWithExpertId = votes.map((vote) => ({
    expert_id: expertId,
    song_id: vote.song_id,
    rank: vote.rank,
  }))

  const { data, error } = await supabase.from("votes").insert(votesWithExpertId).select()

  if (error) {
    console.error("Error submitting votes:", error)
    throw error
  }

  return data
}

export async function deleteExpert(expertId: string) {
  // First delete all votes by this expert
  const { error: votesError } = await supabase.from("votes").delete().eq("expert_id", expertId)

  if (votesError) {
    console.error("Error deleting expert votes:", votesError)
    throw votesError
  }

  // Then delete the expert
  const { error } = await supabase.from("experts").delete().eq("id", expertId)

  if (error) {
    console.error("Error deleting expert:", error)
    throw error
  }

  return true
}

