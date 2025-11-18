import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { localDateString } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubjects } from "@/hooks/use-subjects";
import { useLectures, useCreateLecture, useUpdateLecture } from "@/hooks/use-lectures";
import { useWeeklySchedules } from "@/hooks/use-weekly-schedules";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Lecture, Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium" as "low" | "medium" | "high",
    subjectId: "",
  });
  const [formData, setFormData] = useState({
    subjectId: "",
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:30",
    notes: "",
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: lectures = [], isLoading: lecturesLoading } = useLectures();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: weeklySchedules = [], isLoading: schedulesLoading } = useWeeklySchedules();
  
  const isLoading = subjectsLoading || lecturesLoading || schedulesLoading;
  const createLecture = useCreateLecture();
  const updateLecture = useUpdateLecture();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  // Safely compute dayLectures and dayTasks from selectedDate
  const dayLectures = useMemo(() => {
    if (!selectedDate) return [];
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return [];
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return (lectures || []).filter(l => l && l.date === dateStr);
    } catch {
      return [];
    }
  }, [selectedDate, lectures]);

  const dayTasks = useMemo(() => {
    if (!selectedDate) return [];
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return [];
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return (tasks || []).filter(t => t && t.id && t.date === dateStr);
    } catch {
      return [];
    }
  }, [selectedDate, tasks]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return selectedDate;
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return selectedDate;
      return format(date, "MMMM d, yyyy");
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const days = useMemo(() => {
    const daysArray: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  }, [currentMonth, currentYear, firstDay, daysInMonth]);

  const getLecturesForDay = (day: number) => {
    if (!lectures || !Array.isArray(lectures) || lectures.length === 0) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return lectures.filter(l => l && l.date === dateStr);
  };

  const getTasksForDay = (day: number) => {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t && t.id && t.date === dateStr);
  };

  const getDayTileColor = (day: number): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayDate = new Date(currentYear, currentMonth, day);
    dayDate.setHours(0, 0, 0, 0);
    
    // Future dates or past dates with no lectures
    if (dayDate > today) {
      return null; // Gray - future (will use card background)
    }
    
    const dayLectures = getLecturesForDay(day);
    
    // No lectures for this day
    if (dayLectures.length === 0) {
      return null; // Gray (will use card background)
    }
    
    // Check if all lectures are marked
    const markedLectures = dayLectures.filter(l => l.status);
    if (markedLectures.length === 0) {
      return null; // Gray - not yet marked (will use card background)
    }
    
    // Check if all lectures are attended (present, late, or excused)
    const allAttended = markedLectures.every(l => 
      l.status === "present" || l.status === "late" || l.status === "excused"
    );
    
    if (allAttended) {
      return "#22c55e"; // Green - attended all
    } else {
      return "#ef4444"; // Red - missed one or more
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "present": return "#22c55e";
      case "absent": return "#ef4444";
      case "late": return "#f59e0b";
      case "excused": return "#3b82f6";
      default: return "#d1d5db";
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsDayDialogOpen(true);
  };

  const handleOpenTaskDialog = () => {
    setTaskFormData({
      title: "",
      description: "",
      date: localDateString(new Date()),
      time: "",
      priority: "medium",
      subjectId: "",
    });
    setIsTaskDialogOpen(true);
  };

  const handleTaskSubmit = async () => {
    if (!taskFormData.title || !taskFormData.date) {
      toast({
        title: "Validation Error",
        description: "Task title and date are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData: any = {
        title: taskFormData.title.trim(),
        date: taskFormData.date,
        completed: "false",
      };
      
      if (taskFormData.description?.trim()) {
        taskData.description = taskFormData.description.trim();
      }
      if (taskFormData.time?.trim()) {
        taskData.time = taskFormData.time.trim();
      }
      if (taskFormData.priority) {
        taskData.priority = taskFormData.priority;
      }
      if (taskFormData.subjectId?.trim()) {
        taskData.subjectId = taskFormData.subjectId.trim();
      }
      
      await createTask.mutateAsync(taskData);
      // Reset form after successful creation
      setTaskFormData({
        title: "",
        description: "",
        date: localDateString(new Date()),
        time: "",
        priority: "medium",
        subjectId: "",
      });
      toast({
        title: "Success",
        description: "Task added successfully",
      });
      setIsTaskDialogOpen(false);
    } catch (error: any) {
      console.error("Task creation error:", error);
      const errorMessage = error?.response?.data?.details || error?.response?.data?.error || error?.message || "Failed to add task";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleTaskComplete = async (taskId: string, currentStatus: string) => {
    if (!taskId) return;
    try {
      const newStatus = (currentStatus === "true") ? "false" : "true";
      await updateTask.mutateAsync({
        id: taskId,
        data: { completed: newStatus },
      });
      toast({
        title: "Success",
        description: currentStatus === "true" ? "Task marked as incomplete" : "Task marked as complete",
      });
    } catch (error: any) {
      console.error("Error toggling task:", error);
      const errorMessage = error?.response?.data?.details || error?.response?.data?.error || error?.message || "Failed to update task";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;
    try {
      await deleteTask.mutateAsync(taskId);
      queryClient.setQueryData(["/api/tasks"], (old: any) => Array.isArray(old) ? old.filter((t) => t?.id !== taskId) : old)
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      const errorMessage = error?.response?.data?.details || error?.response?.data?.error || error?.message || "Failed to delete task";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      subjectId: "",
      title: "",
      date: localDateString(new Date()),
      startTime: "09:00",
      endTime: "10:30",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.subjectId || !formData.title || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Subject, title, and date are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createLecture.mutateAsync({
        ...formData,
        status: null,
        attendanceNote: null,
      });
      toast({
        title: "Success",
        description: "Lecture added successfully",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lecture",
        variant: "destructive",
      });
    }
  };

  const handleMarkAttendance = async (lectureId: string, status: string) => {
    try {
      await updateLecture.mutateAsync({
        id: lectureId,
        data: { status },
      });
      toast({
        title: "Success",
        description: `Marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const handleGenerateLectures = async () => {
    if (weeklySchedules.length === 0) {
      toast({
        title: "No Schedules",
        description: "Please add weekly schedules first in the Subjects page",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 90); // Generate for next 90 days
      
      const response = await fetch("/api/weekly-schedules/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: localDateString(today),
          endDate: localDateString(endDate),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate lectures");

      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Generated ${result.generated} lectures for the next 90 days`,
      });

      // Refresh the page to show new lectures
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate lectures",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-2"></div>
            <div className="h-4 w-96 bg-muted rounded mb-6"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Calendar</h1>
            <p className="text-muted-foreground text-sm md:text-base">View and manage your lecture schedule</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {weeklySchedules && weeklySchedules.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleGenerateLectures}
                disabled={isGenerating}
                data-testid="button-generate-lectures"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Lectures"}
              </Button>
            )}
            <Button onClick={handleOpenAddDialog} data-testid="button-add-lecture">
              <Plus className="w-4 h-4 mr-2" />
              Add Lecture
            </Button>
            <Button onClick={handleOpenTaskDialog} variant="outline" data-testid="button-add-task">
              <CheckSquare className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {months[currentMonth]} {currentYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-600"></span> Present</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-600"></span> Absent</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-600"></span> Late</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-600"></span> Excused</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {daysOfWeek.map((day) => (
                <div 
                  key={day} 
                  className="text-center font-semibold text-xs md:text-sm p-1 md:p-2 text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (day === null || day === undefined) {
                  return (
                    <div
                      key={index}
                      className="min-h-[60px] md:min-h-20 p-1 md:p-2 bg-muted/30 border border-transparent rounded-md"
                    />
                  );
                }
                
                const dayLectures = getLecturesForDay(day);
                const dayTasks = getTasksForDay(day);
                const tileColor = getDayTileColor(day);
                const isColored = tileColor !== null;
                
                return (
                  <div
                    key={index}
                    className={`min-h-[60px] md:min-h-20 p-1 md:p-2 border rounded-md transition-all ${
                      "cursor-pointer hover:shadow-md hover:border-primary/50 border-border"
                    } ${
                      !isColored
                        ? "bg-card text-foreground border-border" 
                        : ""
                    }`}
                    style={{
                      backgroundColor: isColored ? tileColor : undefined,
                      color: isColored ? "white" : undefined,
                      borderColor: isColored ? tileColor : undefined,
                    }}
                    onClick={() => handleDayClick(day)}
                    data-testid={`calendar-day-${day}`}
                  >
                    <>
                      <div 
                          className={`text-xs md:text-sm font-medium mb-0.5 md:mb-1 ${
                            dayLectures.length > 0 ? "font-semibold" : ""
                          } ${
                            isColored 
                              ? "text-white" 
                              : "text-foreground"
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-0.5">
                        {dayLectures.length > 0 && (
                            <div 
                              className={`text-[10px] md:text-xs ${
                                isColored 
                                  ? "text-white opacity-90" 
                                  : "text-muted-foreground"
                              }`}
                            >
                              {dayLectures.length} {dayLectures.length === 1 ? "lec" : "lecs"}
                            </div>
                          )}
                          {dayTasks.length > 0 && (
                            <div 
                              className={`text-[10px] md:text-xs flex items-center gap-0.5 ${
                                isColored 
                                  ? "text-white opacity-90" 
                                  : "text-muted-foreground"
                              }`}
                            >
                              <CheckSquare className="w-2.5 h-2.5" />
                              {dayTasks.length}
                          </div>
                        )}
                        </div>
                      </>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-add-lecture">
          <DialogHeader>
            <DialogTitle>Add New Lecture</DialogTitle>
            <DialogDescription>
              Schedule a new lecture and track attendance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={formData.subjectId || undefined} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                <SelectTrigger id="subject" data-testid="select-subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No subjects found. Add one in Subjects.
                    </SelectItem>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Lecture Title</Label>
              <Input
                id="title"
                placeholder="Introduction to Trees"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-lecture-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-lecture-date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  data-testid="input-lecture-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  data-testid="input-lecture-end-time"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                data-testid="textarea-lecture-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createLecture.isPending} data-testid="button-submit-lecture">
              Add Lecture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lectures & Tasks on {formattedSelectedDate}</DialogTitle>
            <DialogDescription>
              Mark attendance and manage tasks for this day
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Lectures Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Lectures</h3>
            {dayLectures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                No lectures scheduled for this day
              </p>
            ) : (
                <div className="space-y-3">
                  {dayLectures.map((lecture) => {
                    if (!lecture || !lecture.id) return null;
                    const subject = subjects.find(s => s && s.id === lecture.subjectId);
                    return (
                      <Card key={lecture.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold">{lecture.title || "Untitled Lecture"}</h4>
                              <p className="text-sm text-muted-foreground">
                                {subject?.name || "Unknown Subject"} - {lecture.startTime || "N/A"} to {lecture.endTime || "N/A"}
                              </p>
                              {lecture.attendanceNote && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  Note: {lecture.attendanceNote}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant={lecture.status === "present" ? "default" : "outline"}
                                onClick={() => lecture.id && handleMarkAttendance(lecture.id, "present")}
                                className={lecture.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={lecture.status === "absent" ? "default" : "outline"}
                                onClick={() => lecture.id && handleMarkAttendance(lecture.id, "absent")}
                                className={lecture.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                              >
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant={lecture.status === "late" ? "default" : "outline"}
                                onClick={() => lecture.id && handleMarkAttendance(lecture.id, "late")}
                                className={lecture.status === "late" ? "bg-amber-600 hover:bg-amber-700" : ""}
                              >
                                Late
                              </Button>
                              <Button
                                size="sm"
                                variant={lecture.status === "excused" ? "default" : "outline"}
                                onClick={() => lecture.id && handleMarkAttendance(lecture.id, "excused")}
                                className={lecture.status === "excused" ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                Excused
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }).filter(Boolean)}
                </div>
            )}
            </div>

            {/* Tasks Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Tasks</h3>
              {dayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No tasks for this day
                </p>
              ) : (
                <div className="space-y-2">
                  {dayTasks.map((task) => {
                    if (!task || !task.id) return null;
                    const isCompleted = task.completed === "true";
                    const subject = task.subjectId ? subjects.find(s => s && s.id === task.subjectId) : null;
                    const joinedCode = (task as any).subjectCode as string | undefined
                    const priorityColors: Record<string, string> = {
                      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    };
                    const priority = task.priority && typeof task.priority === "string" ? task.priority.toLowerCase() : null;
                    const priorityClass = priority && priorityColors[priority] ? priorityColors[priority] : "";
                    
                    return (
                      <Card key={task.id} className={`overflow-hidden ${isCompleted ? "opacity-60" : ""}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => handleToggleTaskComplete(task.id, task.completed || "false")}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                  {task.title || "Untitled Task"}
                                </h4>
                                {priority && (
                                  <Badge variant="secondary" className={priorityClass}>
                                    {priority}
                                  </Badge>
                                )}
                                {(joinedCode || (subject && subject.code)) && (
                                  <Badge variant="outline" className="text-xs">
                                    {joinedCode || subject?.code}
                                  </Badge>
                                )}
                              </div>
                              {task.description && (
                                <p className={`text-xs text-muted-foreground ${isCompleted ? "line-through" : ""}`}>
                                  {task.description}
                                </p>
                              )}
                              {task.time && (
                                <p className="text-xs text-muted-foreground">
                                  ⏰ {task.time}
                                </p>
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone and will permanently remove the task.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => task.id && handleDeleteTask(task.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-add-task">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a task or reminder for a specific date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="Complete assignment"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                data-testid="input-task-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                placeholder="Additional details..."
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                data-testid="textarea-task-description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-date">Date *</Label>
              <Input
                id="task-date"
                type="date"
                value={taskFormData.date}
                onChange={(e) => setTaskFormData({ ...taskFormData, date: e.target.value })}
                data-testid="input-task-date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-time">Time (Optional)</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={taskFormData.time}
                  onChange={(e) => setTaskFormData({ ...taskFormData, time: e.target.value })}
                  data-testid="input-task-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={taskFormData.priority}
                  onValueChange={(value: "low" | "medium" | "high") => setTaskFormData({ ...taskFormData, priority: value })}
                >
                  <SelectTrigger id="task-priority" data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-subject">Subject (Optional)</Label>
              <Select
                value={taskFormData.subjectId || undefined}
                onValueChange={(value) => setTaskFormData({ ...taskFormData, subjectId: value })}
              >
                <SelectTrigger id="task-subject" data-testid="select-task-subject">
                  <SelectValue placeholder="Select subject (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} data-testid="button-cancel-task">
              Cancel
            </Button>
            <Button onClick={handleTaskSubmit} disabled={createTask.isPending} data-testid="button-submit-task">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
