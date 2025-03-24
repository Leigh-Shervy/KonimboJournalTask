"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Lightbulb, BookOpen, ArrowUpRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Thought = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  improvements?: string[]
  resources?: { title: string; url: string }[]
}

export default function ThoughtTracker() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newTag, setNewTag] = useState("")
  const [activeThought, setActiveThought] = useState<Thought | null>(null)
  const [newImprovement, setNewImprovement] = useState("")
  const [newResource, setNewResource] = useState({ title: "", url: "" })
  const [newThought, setNewThought] = useState<Omit<Thought, "id" | "createdAt" | "updatedAt">>({
    title: "",
    content: "",
    category: "idea",
    tags: [],
    improvements: [],
    resources: [],
  })

  // Load thoughts from localStorage on component mount
  useEffect(() => {
    const savedThoughts = localStorage.getItem("thoughts")
    if (savedThoughts) {
      setThoughts(JSON.parse(savedThoughts))
    }
  }, [])

  // Save thoughts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("thoughts", JSON.stringify(thoughts))
  }, [thoughts])

  const handleAddThought = () => {
    if (!newThought.title.trim()) return

    const thought: Thought = {
      ...newThought,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setThoughts([thought, ...thoughts])
    setNewThought({
      title: "",
      content: "",
      category: "idea",
      tags: [],
      improvements: [],
      resources: [],
    })
  }

  const handleAddTag = () => {
    if (!newTag.trim() || newThought.tags.includes(newTag)) return
    setNewThought({
      ...newThought,
      tags: [...newThought.tags, newTag],
    })
    setNewTag("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewThought({
      ...newThought,
      tags: newThought.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleAddImprovement = () => {
    if (!newImprovement.trim() || !activeThought) return

    const updatedThoughts = thoughts.map((thought) => {
      if (thought.id === activeThought.id) {
        const improvements = thought.improvements || []
        return {
          ...thought,
          improvements: [...improvements, newImprovement],
          updatedAt: new Date().toISOString(),
        }
      }
      return thought
    })

    setThoughts(updatedThoughts)
    setNewImprovement("")

    // Update active thought
    const updated = updatedThoughts.find((t) => t.id === activeThought.id)
    if (updated) setActiveThought(updated)
  }

  const handleAddResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim() || !activeThought) return

    const updatedThoughts = thoughts.map((thought) => {
      if (thought.id === activeThought.id) {
        const resources = thought.resources || []
        return {
          ...thought,
          resources: [...resources, newResource],
          updatedAt: new Date().toISOString(),
        }
      }
      return thought
    })

    setThoughts(updatedThoughts)
    setNewResource({ title: "", url: "" })

    // Update active thought
    const updated = updatedThoughts.find((t) => t.id === activeThought.id)
    if (updated) setActiveThought(updated)
  }

  const filteredThoughts = thoughts.filter((thought) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      thought.title.toLowerCase().includes(searchLower) ||
      thought.content.toLowerCase().includes(searchLower) ||
      thought.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "idea":
        return <Lightbulb className="h-4 w-4" />
      case "learning":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Thought Tracker</h1>
        <p className="text-muted-foreground">Capture, improve, and learn from your ideas</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Thought</CardTitle>
              <CardDescription>Capture your ideas, thoughts, and learnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Title"
                  value={newThought.title}
                  onChange={(e) => setNewThought({ ...newThought, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[100px]"
                  value={newThought.content}
                  onChange={(e) => setNewThought({ ...newThought, content: e.target.value })}
                />
              </div>
              <div>
                <Select
                  value={newThought.category}
                  onValueChange={(value) => setNewThought({ ...newThought, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {newThought.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button variant="outline" size="icon" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddThought} className="w-full">
                Save Thought
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search thoughts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredThoughts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No thoughts yet</h3>
              <p className="text-muted-foreground">Add your first thought to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredThoughts.map((thought) => (
                <Card key={thought.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(thought.category)}
                          {thought.category.charAt(0).toUpperCase() + thought.category.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(thought.createdAt)}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setActiveThought(thought)}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{thought.title}</DialogTitle>
                            <DialogDescription>
                              Created on {formatDate(thought.createdAt)}
                              {thought.createdAt !== thought.updatedAt &&
                                ` • Updated on ${formatDate(thought.updatedAt)}`}
                            </DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="content">
                            <TabsList className="grid grid-cols-3">
                              <TabsTrigger value="content">Content</TabsTrigger>
                              <TabsTrigger value="improvements">Improvements</TabsTrigger>
                              <TabsTrigger value="resources">Resources</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-4">
                              <div className="mt-4 whitespace-pre-wrap">{thought.content}</div>
                              <div className="flex flex-wrap gap-2">
                                {thought.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="improvements" className="space-y-4">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add an improvement or next step..."
                                  value={newImprovement}
                                  onChange={(e) => setNewImprovement(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault()
                                      handleAddImprovement()
                                    }
                                  }}
                                />
                                <Button onClick={handleAddImprovement}>Add</Button>
                              </div>

                              {!thought.improvements?.length ? (
                                <div className="text-center py-6 text-muted-foreground">No improvements added yet</div>
                              ) : (
                                <ul className="space-y-2">
                                  {thought.improvements.map((improvement, index) => (
                                    <li key={index} className="p-3 bg-muted rounded-md">
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </TabsContent>

                            <TabsContent value="resources" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                  placeholder="Resource title"
                                  value={newResource.title}
                                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                  className="md:col-span-1"
                                />
                                <Input
                                  placeholder="URL"
                                  value={newResource.url}
                                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                  className="md:col-span-1"
                                />
                                <Button onClick={handleAddResource} className="md:col-span-1">
                                  Add Resource
                                </Button>
                              </div>

                              {!thought.resources?.length ? (
                                <div className="text-center py-6 text-muted-foreground">No resources added yet</div>
                              ) : (
                                <ul className="space-y-2">
                                  {thought.resources.map((resource, index) => (
                                    <li
                                      key={index}
                                      className="p-3 bg-muted rounded-md flex justify-between items-center"
                                    >
                                      <span>{resource.title}</span>
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                      >
                                        Visit <ArrowUpRight className="h-3 w-3" />
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardTitle className="text-lg mt-2">{thought.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{thought.content}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {thought.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {thought.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{thought.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

