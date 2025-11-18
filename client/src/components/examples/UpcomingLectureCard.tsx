import { UpcomingLectureCard } from "../upcoming-lecture-card";

export default function UpcomingLectureCardExample() {
  return (
    <div className="p-6 max-w-md space-y-3">
      <UpcomingLectureCard
        title="Data Structures"
        subject="CS201"
        time="10:00 AM - 11:30 AM"
        date="Today"
        subjectColor="hsl(174, 65%, 41%)"
      />
      <UpcomingLectureCard
        title="Computer Networks"
        subject="CS301"
        time="02:00 PM - 03:30 PM"
        date="Tomorrow"
        subjectColor="hsl(217, 91%, 60%)"
      />
    </div>
  );
}
