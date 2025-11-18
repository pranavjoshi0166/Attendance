import { AttendanceChart } from "../attendance-chart";

export default function AttendanceChartExample() {
  const mockData = [
    { name: "Present", value: 74, color: "hsl(142, 76%, 36%)" },
    { name: "Absent", value: 6, color: "hsl(0, 72%, 51%)" },
    { name: "Late", value: 3, color: "hsl(45, 93%, 47%)" },
    { name: "Excused", value: 1, color: "hsl(217, 91%, 60%)" },
  ];

  return (
    <div className="p-6 max-w-md">
      <AttendanceChart data={mockData} />
    </div>
  );
}
