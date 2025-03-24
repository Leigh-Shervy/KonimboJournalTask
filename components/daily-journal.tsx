"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  isSameDay,
  differenceInDays,
  addWeeks,
  subWeeks,
  isToday,
  isSameWeek,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, BookOpen, Calendar, BarChart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type JournalEntry = {
  id: string
  date: string // ISO string
  content: string
}

type WeeklySummary = {
  id: string
  weekStartDate: string // ISO string
  weekEndDate: string // ISO string
  differentOrSpecial: string
  learned: string
  wantToLearn: string
  completed: boolean
}

export default function DailyJournal() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])
  const [currentEntry, setCurrentEntry] = useState("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("today")
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [currentWeekSummary, setCurrentWeekSummary] = useState<WeeklySummary>({
    id: "",
    weekStartDate: "",
    weekEndDate: "",
    differentOrSpecial: "",
    learned: "",
    wantToLearn: "",
    completed: false,
  })
  const { toast } = useToast()

  // Load entries and summaries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("journalEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }

    const savedSummaries = localStorage.getItem("weeklySummaries")
    if (savedSummaries) {
      setWeeklySummaries(JSON.parse(savedSummaries))
    }
  }, [])

  // Save entries and summaries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem("weeklySummaries", JSON.stringify(weeklySummaries))
  }, [weeklySummaries])

  // Update current week start when selected date changes
  useEffect(() => {
    setCurrentWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }))
  }, [selectedDate])

  // Load current entry for selected date
  useEffect(() => {
    const existingEntry = entries.find((entry) => isSameDay(new Date(entry.date), selectedDate))

    if (existingEntry) {
      setCurrentEntry(existingEntry.content)
    } else {
      setCurrentEntry("")
    }
  }, [selectedDate, entries])

  // Load current week summary
  useEffect(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

    const existingSummary = weeklySummaries.find((summary) =>
      isSameDay(new Date(summary.weekStartDate), currentWeekStart),
    )

    if (existingSummary) {
      setCurrentWeekSummary(existingSummary)
    } else {
      setCurrentWeekSummary({
        id: currentWeekStart.toISOString(),
        weekStartDate: currentWeekStart.toISOString(),
        weekEndDate: weekEnd.toISOString(),
        differentOrSpecial: "",
        learned: "",
        wantToLearn: "",
        completed: false,
      })
    }
  }, [currentWeekStart, weeklySummaries])

  const saveEntry = () => {
    if (!currentEntry.trim()) return

    const existingEntryIndex = entries.findIndex((entry) => isSameDay(new Date(entry.date), selectedDate))

    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...entries]
      updatedEntries[existingEntryIndex] = {
        ...updatedEntries[existingEntryIndex],
        content: currentEntry,
      }
      setEntries(updatedEntries)
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: selectedDate.toISOString(),
        date: selectedDate.toISOString(),
        content: currentEntry,
      }
      setEntries([...entries, newEntry])
    }

    // Show success toast
    toast({
      title: "Entry saved!",
      description: "The entry was saved, you're one step closer to your goal.",
      duration: 3000,
    })
  }

  const saveWeeklySummary = () => {
    const existingSummaryIndex = weeklySummaries.findIndex((summary) =>
      isSameDay(new Date(summary.weekStartDate), currentWeekStart),
    )

    if (existingSummaryIndex >= 0) {
      // Update existing summary
      const updatedSummaries = [...weeklySummaries]
      updatedSummaries[existingSummaryIndex] = {
        ...currentWeekSummary,
        completed: true,
      }
      setWeeklySummaries(updatedSummaries)
    } else {
      // Create new summary
      setWeeklySummaries([
        ...weeklySummaries,
        {
          ...currentWeekSummary,
          completed: true,
        },
      ])
    }

    // Show success toast for weekly summary
    toast({
      title: "Weekly reflection completed!",
      description: "Great job reflecting on your week and setting intentions for the next.",
      duration: 3000,
    })
  }

  const handlePreviousDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1))
  }

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1))
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prevWeek) => subWeeks(prevWeek, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart((prevWeek) => addWeeks(prevWeek, 1))
  }

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  })

  const hasEntryForDate = (date: Date) => {
    return entries.some((entry) => isSameDay(new Date(entry.date), date))
  }

  const getEntryForDate = (date: Date) => {
    return entries.find((entry) => isSameDay(new Date(entry.date), date))
  }

  const formatDateRange = (start: Date, end: Date) => {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
  }

  const isCurrentWeek = (date: Date) => {
    return isSameWeek(date, new Date(), { weekStartsOn: 1 })
  }

  const isPastWeek = (date: Date) => {
    return differenceInDays(new Date(), date) > 7
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Me Journal S</h1>
        <p className="text-muted-foreground mb-4">Capture your thoughts each day, reflect each week</p>
        <p className="text-sm italic max-w-lg mx-auto">
          "If you can get 1 percent better each day for one year, you'll end up thirty-seven times better by the time
          you're done."
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Weekly Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date)
                            setCalendarOpen(false)
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button variant="outline" size="icon" onClick={handleNextDay} disabled={isToday(selectedDate)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-center">
                {isToday(selectedDate)
                  ? "Today's Reflection"
                  : `Reflection for ${format(selectedDate, "MMMM d, yyyy")}`}
              </CardTitle>
              <CardDescription className="text-center">Take a moment to reflect on your day</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What happened today? How did you feel? What did you learn?"
                className="min-h-[200px]"
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveEntry}>Save Entry</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Journal Calendar</CardTitle>
              <CardDescription>View and navigate your past entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center font-medium text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const hasEntry = hasEntryForDate(day)
                  return (
                    <Button
                      key={day.toString()}
                      variant={isSameDay(day, selectedDate) ? "default" : hasEntry ? "secondary" : "outline"}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center",
                        isSameDay(day, new Date()) && !isSameDay(day, selectedDate) && "border-primary",
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <span className="text-sm">{format(day, "d")}</span>
                      {hasEntry && <CheckCircle className="h-4 w-4 text-green-500 mt-1" />}
                    </Button>
                  )
                })}
              </div>

              {hasEntryForDate(selectedDate) && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">{format(selectedDate, "MMMM d, yyyy")}</h3>
                  <p className="whitespace-pre-wrap text-sm">{getEntryForDate(selectedDate)?.content}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <span className="font-medium">
                    {formatDateRange(currentWeekStart, endOfWeek(currentWeekStart, { weekStartsOn: 1 }))}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextWeek}
                  disabled={isCurrentWeek(currentWeekStart)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>Weekly Reflection</CardTitle>
              <CardDescription>Review your week and set intentions for the next</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const hasEntry = hasEntryForDate(day)
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "text-center p-2 rounded-md cursor-pointer",
                        hasEntry ? "bg-primary/10" : "bg-muted",
                        isSameDay(day, new Date()) && "border border-primary",
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-xs font-medium">{format(day, "EEE")}</div>
                      <div className="text-sm">{format(day, "d")}</div>
                      {hasEntry ? (
                        <div className="mt-1 flex justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-xs opacity-50">
                          Empty
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              {isPastWeek(currentWeekStart) && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Did you do something different or special last week?</h3>
                    <Textarea
                      placeholder="Reflect on any unique experiences..."
                      value={currentWeekSummary.differentOrSpecial}
                      onChange={(e) =>
                        setCurrentWeekSummary({
                          ...currentWeekSummary,
                          differentOrSpecial: e.target.value,
                        })
                      }
                      disabled={currentWeekSummary.completed}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Is there something you learned?</h3>
                    <Textarea
                      placeholder="What new insights or knowledge did you gain?"
                      value={currentWeekSummary.learned}
                      onChange={(e) =>
                        setCurrentWeekSummary({
                          ...currentWeekSummary,
                          learned: e.target.value,
                        })
                      }
                      disabled={currentWeekSummary.completed}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">What do you want to learn next week?</h3>
                    <Textarea
                      placeholder="Set your learning intentions for the coming week..."
                      value={currentWeekSummary.wantToLearn}
                      onChange={(e) =>
                        setCurrentWeekSummary({
                          ...currentWeekSummary,
                          wantToLearn: e.target.value,
                        })
                      }
                      disabled={currentWeekSummary.completed}
                    />
                  </div>

                  {!currentWeekSummary.completed && (
                    <Button onClick={saveWeeklySummary} className="w-full">
                      Complete Weekly Reflection
                    </Button>
                  )}

                  {currentWeekSummary.completed && (
                    <div className="p-3 bg-primary/10 rounded-md text-center">
                      <p className="text-sm font-medium">Weekly reflection completed</p>
                    </div>
                  )}
                </div>
              )}

              {isCurrentWeek(currentWeekStart) && (
                <div className="p-6 text-center">
                  <h3 className="font-medium mb-2">Current Week in Progress</h3>
                  <p className="text-muted-foreground">
                    Continue adding daily entries. You'll be able to complete your weekly reflection at the end of the
                    week.
                  </p>
                </div>
              )}

              {!isPastWeek(currentWeekStart) && !isCurrentWeek(currentWeekStart) && (
                <div className="p-6 text-center">
                  <h3 className="font-medium mb-2">Future Week</h3>
                  <p className="text-muted-foreground">
                    This week hasn't happened yet. Check back later to add entries and reflections.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Your entries are saved locally in your browser.</p>
      </div>
    </div>
  )
}

