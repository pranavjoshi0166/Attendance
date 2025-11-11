import { useState, useMemo } from "react";
import { SubjectCard } from "@/components/subject-card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/hooks/use-subjects";
import { useWeeklySchedules, useCreateWeeklySchedule, useUpdateWeeklySchedule, useDeleteWeeklySchedule } from "@/hooks/use-weekly-schedules";
import { useLectures } from "@/hooks/use-lectures";
import { useToast } from "@/hooks/use-toast";
import type { Subject, WeeklySchedule } from "@shared/schema";

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function Subjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [selectedSubjectForSchedule, setSelectedSubjectForSchedule] = useState<Subject | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacher: "",
    color: "#0ea5a0",
  });
  const [scheduleFormData, setScheduleFormData] = useState({
    weekday: 1,
    startTime: "09:00",
    endTime: "10:30",
    title: "",
  });

  const { data: subjects = [], isLoading } = useSubjects();
  const { data: lectures = [] } = useLectures();
  const { data: weeklySchedules = [] } = useWeeklySchedules();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const createWeeklySchedule = useCreateWeeklySchedule();
  const updateWeeklySchedule = useUpdateWeeklySchedule();
  const deleteWeeklySchedule = useDeleteWeeklySchedule();
  const { toast } = useToast();

  const subjectsWithAttendance = useMemo(() => {
    if (!subjects || !lectures) return [];
    return subjects.map(subject => {
      const subjectLectures = lectures.filter(l => l && l.subjectId === subject.id);
      const attendedLectures = subjectLectures.filter(l => l.status === "present" || l.status === "late" || l.status === "excused").length;
      const totalLectures = subjectLectures.filter(l => l.status).length;
      const attendancePercentage = totalLectures > 0 
        ? Math.round((attendedLectures / totalLectures) * 100) 
        : 0;

      return {
        ...subject,
        attendancePercentage,
      };
    });
  }, [subjects, lectures]);

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        teacher: subject.teacher || "",
        color: subject.color,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        code: "",
        teacher: "",
        color: "#0ea5a0",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Validation Error",
        description: "Subject name and code are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare data - convert empty strings to null for optional fields
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        teacher: formData.teacher?.trim() || null,
        color: formData.color || "#0ea5a0",
      };

      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          data: submitData,
        });
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        await createSubject.mutateAsync(submitData);
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving subject:", error);
      const errorMessage = error?.response?.data?.details || error?.response?.data?.error || error?.message || "Failed to save subject";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSubjectId) return;

    try {
      await deleteSubject.mutateAsync(deletingSubjectId);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeletingSubjectId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingSubjectId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenScheduleDialog = (subject: Subject, schedule?: WeeklySchedule) => {
    setSelectedSubjectForSchedule(subject);
    if (schedule) {
      setEditingSchedule(schedule);
      setScheduleFormData({
        weekday: schedule.weekday,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        title: schedule.title,
      });
    } else {
      setEditingSchedule(null);
      setScheduleFormData({
        weekday: 1,
        startTime: "09:00",
        endTime: "10:30",
        title: "",
      });
    }
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedSubjectForSchedule || !scheduleFormData.title) {
      toast({
        title: "Validation Error",
        description: "Lecture title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSchedule) {
        await updateWeeklySchedule.mutateAsync({
          id: editingSchedule.id,
          data: scheduleFormData,
        });
        toast({
          title: "Success",
          description: "Weekly schedule updated successfully",
        });
      } else {
        await createWeeklySchedule.mutateAsync({
          subjectId: selectedSubjectForSchedule.id,
          ...scheduleFormData,
        });
        toast({
          title: "Success",
          description: "Weekly schedule created. Lectures will be auto-generated.",
        });
      }
      setIsScheduleDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save weekly schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteWeeklySchedule.mutateAsync(scheduleId);
      toast({
        title: "Success",
        description: "Weekly schedule deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete weekly schedule",
        variant: "destructive",
      });
    }
  };

  const getSubjectSchedules = (subjectId: string) => {
    if (!weeklySchedules || !subjectId) return [];
    return weeklySchedules.filter(s => s && s.subjectId === subjectId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-2"></div>
            <div className="h-4 w-96 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold mb-2">Subjects</h1>
            <p className="text-muted-foreground">Manage your courses and weekly schedules</p>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-subject">
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {subjectsWithAttendance.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No subjects added yet</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="subjects" className="space-y-6">
            <TabsList>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="schedules">Weekly Schedules</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectsWithAttendance.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    {...subject}
                    onEdit={() => handleOpenDialog(subject)}
                    onDelete={() => openDeleteDialog(subject.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedules" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Weekly Schedule Manager</h2>
                  <p className="text-sm text-muted-foreground">
                    Create recurring schedules that auto-generate lectures each week
                  </p>
                </div>
              </div>
              {subjects.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">Add a subject first to create schedules</p>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                subjects.map((subject) => {
                  if (!subject || !subject.id) return null;
                const subjectSchedules = getSubjectSchedules(subject.id);
                return (
                  <Card key={subject.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: subject.color || "#0ea5a0" }}
                            />
                        <div>
                              <CardTitle className="text-lg">{subject.name || "Untitled"}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">{subject.code || ""}</p>
                            </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleOpenScheduleDialog(subject)}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Add Schedule
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {subjectSchedules.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-4">
                          No weekly schedules. Add one to auto-generate lectures.
                        </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenScheduleDialog(subject)}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Create First Schedule
                            </Button>
                          </div>
                      ) : (
                        <div className="space-y-3">
                            {subjectSchedules.map((schedule) => {
                              if (!schedule || !schedule.id) return null;
                              return (
                            <div
                              key={schedule.id}
                                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                            >
                              <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="secondary" className="font-semibold">
                                        {weekdays.find(w => w.value === schedule.weekday)?.label || "Unknown"}
                                  </Badge>
                                      <span className="font-semibold text-foreground">{schedule.title || "Untitled"}</span>
                                </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      <p className="text-muted-foreground">
                                        <span className="font-medium">Time:</span> {schedule.startTime || "N/A"} - {schedule.endTime || "N/A"}
                                </p>
                                    </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                      variant="outline"
                                  onClick={() => handleOpenScheduleDialog(subject, schedule)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                      className="text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                              );
                            })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
                }).filter(Boolean)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-add-subject">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
            <DialogDescription>
              {editingSubject ? "Update subject details" : "Create a new subject to track attendance"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="Data Structures"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-subject-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                placeholder="CS201"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                data-testid="input-subject-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Instructor</Label>
              <Input
                id="teacher"
                placeholder="Dr. Sarah Johnson"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                data-testid="input-subject-teacher"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                data-testid="input-subject-color"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createSubject.isPending || updateSubject.isPending}
              data-testid="button-submit-subject"
            >
              {editingSubject ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weekly Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Weekly Schedule" : "Add Weekly Schedule"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubjectForSchedule && `For ${selectedSubjectForSchedule.name}`}
              {editingSchedule ? " Update the recurring lecture schedule" : " Create a recurring lecture that will auto-generate on the selected day each week"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-title">Lecture Title</Label>
              <Input
                id="schedule-title"
                placeholder="Introduction to Data Structures"
                value={scheduleFormData.title}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-weekday">Day of Week</Label>
              <Select
                value={scheduleFormData.weekday.toString()}
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, weekday: parseInt(value) })}
              >
                <SelectTrigger id="schedule-weekday">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-start-time">Start Time</Label>
                <Input
                  id="schedule-start-time"
                  type="time"
                  value={scheduleFormData.startTime}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-end-time">End Time</Label>
                <Input
                  id="schedule-end-time"
                  type="time"
                  value={scheduleFormData.endTime}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              disabled={createWeeklySchedule.isPending || updateWeeklySchedule.isPending}
            >
              {editingSchedule ? "Update Schedule" : "Add Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject and all associated lectures.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
