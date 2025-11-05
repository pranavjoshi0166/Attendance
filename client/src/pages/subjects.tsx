import { useState } from "react";
import { SubjectCard } from "@/components/subject-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

//todo: remove mock functionality
const mockSubjects = [
  {
    id: "1",
    name: "Data Structures",
    code: "CS201",
    teacher: "Dr. Sarah Johnson",
    attendancePercentage: 95,
    color: "hsl(174, 65%, 41%)",
  },
  {
    id: "2",
    name: "Computer Networks",
    code: "CS301",
    teacher: "Prof. Mike Chen",
    attendancePercentage: 88,
    color: "hsl(217, 91%, 60%)",
  },
  {
    id: "3",
    name: "Database Systems",
    code: "CS202",
    teacher: "Dr. Emily Brown",
    attendancePercentage: 72,
    color: "hsl(45, 93%, 47%)",
  },
  {
    id: "4",
    name: "Operating Systems",
    code: "CS302",
    teacher: "Prof. David Lee",
    attendancePercentage: 91,
    color: "hsl(142, 76%, 36%)",
  },
];

export default function Subjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subjects] = useState(mockSubjects);

  const handleAddSubject = () => {
    console.log("Add subject triggered");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subjects</h1>
            <p className="text-muted-foreground">Manage your courses and track attendance</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-subject">
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              {...subject}
              onEdit={() => console.log("Edit subject", subject.id)}
              onDelete={() => console.log("Delete subject", subject.id)}
            />
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-add-subject">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Create a new subject to track attendance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input id="name" placeholder="Data Structures" data-testid="input-subject-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input id="code" placeholder="CS201" data-testid="input-subject-code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Instructor</Label>
              <Input id="teacher" placeholder="Dr. Sarah Johnson" data-testid="input-subject-teacher" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="color" defaultValue="#2da89e" data-testid="input-subject-color" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleAddSubject} data-testid="button-submit-subject">
              Add Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
