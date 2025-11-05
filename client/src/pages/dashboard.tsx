import { StatCard } from "@/components/stat-card";
import { AttendanceChart } from "@/components/attendance-chart";
import { UpcomingLectureCard } from "@/components/upcoming-lecture-card";
import { CheckCircle2, BookOpen, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatistics } from "@/hooks/use-statistics";
import { useLectures } from "@/hooks/use-lectures";
import { useSubjects } from "@/hooks/use-subjects";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStatistics();
  const { data: lectures = [], isLoading: lecturesLoading } = useLectures();
  const { data: subjects = [] } = useSubjects();

  const attendanceData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Present", value: stats.breakdown.present, color: "hsl(142, 76%, 36%)" },
      { name: "Absent", value: stats.breakdown.absent, color: "hsl(0, 72%, 51%)" },
      { name: "Late", value: stats.breakdown.late, color: "hsl(45, 93%, 47%)" },
      { name: "Excused", value: stats.breakdown.excused, color: "hsl(217, 91%, 60%)" },
    ];
  }, [stats]);

  const upcomingLectures = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return lectures
      .filter(lecture => {
        const lectureDate = new Date(lecture.date);
        lectureDate.setHours(0, 0, 0, 0);
        return lectureDate >= today && !lecture.status;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.startTime);
        const dateB = new Date(b.date + ' ' + b.startTime);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5)
      .map(lecture => {
        const subject = subjects.find(s => s.id === lecture.subjectId);
        const lectureDate = new Date(lecture.date);
        lectureDate.setHours(0, 0, 0, 0);
        
        let dateLabel = "Today";
        if (lectureDate.getTime() === tomorrow.getTime()) {
          dateLabel = "Tomorrow";
        } else if (lectureDate.getTime() > tomorrow.getTime()) {
          dateLabel = lectureDate.toLocaleDateString();
        }

        return {
          id: lecture.id,
          title: lecture.title,
          subject: subject?.code || "N/A",
          time: `${lecture.startTime} - ${lecture.endTime}`,
          date: dateLabel,
          color: subject?.color || "hsl(174, 65%, 41%)",
        };
      });
  }, [lectures, subjects]);

  if (statsLoading || lecturesLoading) {
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
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Good Morning, Pranav 👋</h1>
          <p className="text-muted-foreground">Here's your attendance summary for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Attendance"
            value={`${stats?.attendancePercentage || 0}%`}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Lectures Attended"
            value={stats?.attendedLectures || 0}
            icon={BookOpen}
            variant="default"
          />
          <StatCard
            title="Lectures Missed"
            value={stats?.missedLectures || 0}
            icon={XCircle}
            variant="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart data={attendanceData} />

          <Card data-testid="card-upcoming-lectures">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Lectures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingLectures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming lectures scheduled
                </p>
              ) : (
                upcomingLectures.map((lecture) => (
                  <UpcomingLectureCard
                    key={lecture.id}
                    title={lecture.title}
                    subject={lecture.subject}
                    time={lecture.time}
                    date={lecture.date}
                    subjectColor={lecture.color}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
