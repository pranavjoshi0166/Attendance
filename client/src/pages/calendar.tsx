import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Lecture } from "@shared/schema";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState({
    subjectId: "",
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:30",
    notes: "",
  });

  const { data: subjects = [] } = useSubjects();
  const { data: lectures = [], isLoading } = useLectures();
  const createLecture = useCreateLecture();
  const updateLecture = useUpdateLecture();
  const { toast } = useToast();

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

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getLecturesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return lectures.filter(l => l.date === dateStr);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "present": return "hsl(142, 76%, 36%)";
      case "absent": return "hsl(0, 72%, 51%)";
      case "late": return "hsl(45, 93%, 47%)";
      case "excused": return "hsl(217, 91%, 60%)";
      default: return "hsl(174, 65%, 41%)";
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsDayDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setFormData({
      subjectId: "",
      title: "",
      date: new Date().toISOString().split('T')[0],
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

  const dayLectures = selectedDate ? getLecturesForDay(parseInt(selectedDate.split('-')[2])) : [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendar</h1>
            <p className="text-muted-foreground">View and manage your lecture schedule</p>
          </div>
          <Button onClick={handleOpenAddDialog} data-testid="button-add-lecture">
            <Plus className="w-4 h-4 mr-2" />
            Add Lecture
          </Button>
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center font-semibold text-sm p-2 text-muted-foreground">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const dayLectures = day ? getLecturesForDay(day) : [];
                return (
                  <div
                    key={index}
                    className={`min-h-20 p-2 border rounded-md ${
                      day ? "cursor-pointer hover-elevate" : "bg-muted/30"
                    }`}
                    onClick={() => day && handleDayClick(day)}
                    data-testid={day ? `calendar-day-${day}` : undefined}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium mb-1">{day}</div>
                        <div className="flex flex-wrap gap-1">
                          {dayLectures.slice(0, 3).map((lecture) => (
                            <div
                              key={lecture.id}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStatusColor(lecture.status) }}
                            />
                          ))}
                        </div>
                      </>
                    )}
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
              <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                <SelectTrigger id="subject" data-testid="select-subject">
                  <SelectValue placeholder="Select subject" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lectures on {selectedDate}</DialogTitle>
            <DialogDescription>
              Mark attendance for your lectures
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {dayLectures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No lectures scheduled for this day
              </p>
            ) : (
              dayLectures.map((lecture) => {
                const subject = subjects.find(s => s.id === lecture.subjectId);
                return (
                  <Card key={lecture.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold">{lecture.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {subject?.name} - {lecture.startTime} to {lecture.endTime}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant={lecture.status === "present" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(lecture.id, "present")}
                            style={lecture.status === "present" ? { backgroundColor: "hsl(142, 76%, 36%)" } : undefined}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={lecture.status === "absent" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(lecture.id, "absent")}
                            style={lecture.status === "absent" ? { backgroundColor: "hsl(0, 72%, 51%)" } : undefined}
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={lecture.status === "late" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(lecture.id, "late")}
                            style={lecture.status === "late" ? { backgroundColor: "hsl(45, 93%, 47%)" } : undefined}
                          >
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant={lecture.status === "excused" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(lecture.id, "excused")}
                            style={lecture.status === "excused" ? { backgroundColor: "hsl(217, 91%, 60%)" } : undefined}
                          >
                            Excused
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
