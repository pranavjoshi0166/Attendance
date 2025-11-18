import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

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

  const chartConfig: ChartConfig = data.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.color,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card data-testid="card-attendance-chart">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Breakdown of marked lectures by status
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
            No attendance records yet. Start marking lectures to see insights.
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[320px] w-full [&_.recharts-responsive-container]:max-h-[320px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between">
                          <span>{name}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <ChartLegend
                  verticalAlign="bottom"
                  content={<ChartLegendContent />}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Total marked lectures:{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
