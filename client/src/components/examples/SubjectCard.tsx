import { SubjectCard } from "../subject-card";

export default function SubjectCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SubjectCard
        id="1"
        name="Data Structures"
        code="CS201"
        teacher="Dr. Sarah Johnson"
        attendancePercentage={95}
        color="hsl(174, 65%, 41%)"
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
      <SubjectCard
        id="2"
        name="Computer Networks"
        code="CS301"
        teacher="Prof. Mike Chen"
        attendancePercentage={88}
        color="hsl(217, 91%, 60%)"
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
      <SubjectCard
        id="3"
        name="Database Systems"
        code="CS202"
        teacher="Dr. Emily Brown"
        attendancePercentage={72}
        color="hsl(45, 93%, 47%)"
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
    </div>
  );
}
