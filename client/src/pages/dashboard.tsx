import { StatCard } from "@/components/stat-card";
import { AttendanceChart } from "@/components/attendance-chart";
import { AttendanceLineChart } from "@/components/attendance-line-chart";
import { CheckCircle2, BookOpen, XCircle, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatistics } from "@/hooks/use-statistics";
import { useLectures } from "@/hooks/use-lectures";
import { useSubjects } from "@/hooks/use-subjects";
import { useMemo } from "react";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";

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

  const attendanceTrendData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate data for the last 7 weeks
    const weeks: { period: string; attended: number; missed: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(today, i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekLectures = lectures.filter(lecture => {
        const lectureDate = new Date(lecture.date);
        lectureDate.setHours(0, 0, 0, 0);
        return lectureDate >= weekStart && lectureDate <= weekEnd && lecture.status;
      });
      
      const attended = weekLectures.filter(l => 
        l.status === "present" || l.status === "late" || l.status === "excused"
      ).length;
      
      const missed = weekLectures.filter(l => l.status === "absent").length;
      
      weeks.push({
        period: `Week ${7 - i}`,
        attended,
        missed,
      });
    }
    
    return weeks;
  }, [lectures]);

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
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Track today, succeed tomorrow.</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Attendance"
            value={`${stats?.attendancePercentage || 0}%`}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Total Lectures"
            value={stats?.totalLectures || 0}
            icon={GraduationCap}
            variant="default"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <AttendanceLineChart data={attendanceTrendData} />
          <AttendanceChart data={attendanceData} />
        </div>
      </div>
    </div>
  );
}
