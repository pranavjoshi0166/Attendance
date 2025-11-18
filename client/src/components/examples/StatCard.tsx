import { StatCard } from "../stat-card";
import { CheckCircle2, BookOpen, XCircle } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
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
  );
}
