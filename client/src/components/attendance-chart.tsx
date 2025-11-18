import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceData {
  name: string;
  value: number;
  color: string;
}

interface AttendanceChartProps {
  data: AttendanceData[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Card data-testid="card-attendance-chart">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm">
          Total: {total}
        </div>
      </CardContent>
    </Card>
  );
}
