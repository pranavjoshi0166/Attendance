import { StatCard } from "@/components/stat-card";
import { AttendanceChart } from "@/components/attendance-chart";
import { UpcomingLectureCard } from "@/components/upcoming-lecture-card";
import { CheckCircle2, BookOpen, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

//todo: remove mock functionality
const mockAttendanceData = [
  { name: "Present", value: 74, color: "hsl(142, 76%, 36%)" },
  { name: "Absent", value: 6, color: "hsl(0, 72%, 51%)" },
  { name: "Late", value: 3, color: "hsl(45, 93%, 47%)" },
  { name: "Excused", value: 1, color: "hsl(217, 91%, 60%)" },
];

//todo: remove mock functionality
const mockUpcomingLectures = [
  {
    id: "1",
    title: "Data Structures",
    subject: "CS201",
    time: "10:00 AM - 11:30 AM",
    date: "Today",
    color: "hsl(174, 65%, 41%)",
  },
  {
    id: "2",
    title: "Computer Networks",
    subject: "CS301",
    time: "02:00 PM - 03:30 PM",
    date: "Tomorrow",
    color: "hsl(217, 91%, 60%)",
  },
];

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Good Morning, Pranav 👋</h1>
          <p className="text-muted-foreground">Here's your attendance summary for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Attendance"
            value="92.5%"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Lectures Attended"
            value={74}
            icon={BookOpen}
            variant="default"
          />
          <StatCard
            title="Lectures Missed"
            value={6}
            icon={XCircle}
            variant="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart data={mockAttendanceData} />

          <Card data-testid="card-upcoming-lectures">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Lectures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockUpcomingLectures.map((lecture) => (
                <UpcomingLectureCard
                  key={lecture.id}
                  title={lecture.title}
                  subject={lecture.subject}
                  time={lecture.time}
                  date={lecture.date}
                  subjectColor={lecture.color}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
