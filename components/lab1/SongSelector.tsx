"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Song, Vote } from "@/types"
import { Check, GripVertical } from "lucide-react"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd"

interface SongSelectorProps {
  songs: Song[]
  selectedSongs: Song[]
  onSongSelect: (song: Song) => void
  onSongsReorder: (songs: Song[]) => void
  onVoteSubmit: (votes: Vote[]) => void
  disabled?: boolean
}

export default function SongSelector({
  songs,
  selectedSongs,
  onSongSelect,
  onSongsReorder,
  onVoteSubmit,
  disabled = false,
}: SongSelectorProps) {
  const handleSongSelect = (song: Song) => {
    if (!disabled) {
      onSongSelect(song)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(selectedSongs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onSongsReorder(items)
  }

  const handleSubmitVotes = () => {
    if (selectedSongs.length > 0) {
      const votes: Vote[] = selectedSongs.map((song, index) => ({
        songId: song.id,
        rank: index + 1,
      }))
      onVoteSubmit(votes)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Your Selected Songs ({selectedSongs.length}/3)</h3>
        {selectedSongs.length === 0 ? (
          <p className="text-muted-foreground">Select up to 3 songs from the list below</p>
        ) : (
          <div className="space-y-2">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="selected-songs">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-2 rounded-lg ${snapshot.isDraggingOver ? "bg-accent/50" : ""}`}
                  >
                    {selectedSongs.map((song, index) => (
                      <Draggable key={song.id} draggableId={song.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-3 transition-colors ${snapshot.isDragging ? "bg-accent shadow-lg" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                                  {song.title}
                                </div>
                                <div className="text-sm text-muted-foreground">{song.artist}</div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button
              className="w-full mt-4"
              onClick={handleSubmitVotes}
              disabled={selectedSongs.length === 0 || disabled}
            >
              Submit Votes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {songs.map((song) => {
          const isSelected = selectedSongs.some((s) => s.id === song.id)
          return (
            <Card
              key={song.id}
              className={`p-4 cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleSongSelect(song)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                  <p className="text-xs text-muted-foreground mt-1">{song.genre}</p>
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

