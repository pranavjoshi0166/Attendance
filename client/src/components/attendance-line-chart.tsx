import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface AttendanceTrendData {
  period: string;
  attended: number;
  missed: number;
}

interface AttendanceLineChartProps {
  data: AttendanceTrendData[];
}

export function AttendanceLineChart({ data }: AttendanceLineChartProps) {
  const totalAttended = data.reduce((s, d) => s + d.attended, 0);
  const totalMissed = data.reduce((s, d) => s + d.missed, 0);

  const chartConfig: ChartConfig = {
    attended: {
      label: "Attended",
      color: "hsl(142, 76%, 36%)",
    },
    missed: {
      label: "Missed",
      color: "hsl(0, 72%, 51%)",
    },
  };

  if (data.length === 0 || (totalAttended === 0 && totalMissed === 0)) {
    return (
      <Card data-testid="card-attendance-line-chart">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Weekly attendance patterns over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
            No attendance data available yet. Start marking lectures to see trends.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-attendance-line-chart" className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Weekly attendance patterns over the last 7 weeks
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis 
                dataKey="period" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm font-medium">
                                {entry.name === "attended" ? "Attended" : "Missed"}: {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="attended"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={{ fill: "hsl(142, 76%, 36%)", r: 4 }}
                activeDot={{ r: 6 }}
                name="attended"
              />
              <Line
                type="monotone"
                dataKey="missed"
                stroke="hsl(0, 72%, 51%)"
                strokeWidth={2}
                dot={{ fill: "hsl(0, 72%, 51%)", r: 4 }}
                activeDot={{ r: 6 }}
                name="missed"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-600" />
            <span className="text-muted-foreground">Total Attended:</span>
            <span className="font-semibold text-foreground">{totalAttended}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-600" />
            <span className="text-muted-foreground">Total Missed:</span>
            <span className="font-semibold text-foreground">{totalMissed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

