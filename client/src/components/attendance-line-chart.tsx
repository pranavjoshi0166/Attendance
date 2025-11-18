import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceTrendData {
  period: string;
  attended: number;
  missed: number;
}

interface AttendanceLineChartProps {
  data: AttendanceTrendData[];
}

export function AttendanceLineChart({ data }: AttendanceLineChartProps) {
  const totalAttended = data.reduce((s, d) => s + d.attended, 0)
  const totalMissed = data.reduce((s, d) => s + d.missed, 0)
  return (
    <Card data-testid="card-attendance-line-chart">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm bg-green-600" /> Attended total: {totalAttended}</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm bg-red-600" /> Missed total: {totalMissed}</div>
        </div>
      </CardContent>
    </Card>
  );
}

