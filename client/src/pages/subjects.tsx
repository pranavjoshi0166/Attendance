import { useState, useMemo } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/hooks/use-subjects";
import { useLectures } from "@/hooks/use-lectures";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@shared/schema";

export default function Subjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacher: "",
    color: "#2da89e",
  });

  const { data: subjects = [], isLoading } = useSubjects();
  const { data: lectures = [] } = useLectures();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const { toast } = useToast();

  const subjectsWithAttendance = useMemo(() => {
    return subjects.map(subject => {
      const subjectLectures = lectures.filter(l => l.subjectId === subject.id);
      const attendedLectures = subjectLectures.filter(l => l.status === "present" || l.status === "late").length;
      const totalLectures = subjectLectures.filter(l => l.status).length;
      const attendancePercentage = totalLectures > 0 
        ? Math.round((attendedLectures / totalLectures) * 100) 
        : 0;

      return {
        ...subject,
        attendancePercentage,
      };
    });
  }, [subjects, lectures]);

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        teacher: subject.teacher || "",
        color: subject.color,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        code: "",
        teacher: "",
        color: "#2da89e",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Validation Error",
        description: "Subject name and code are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          data: formData,
        });
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        await createSubject.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subject",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSubjectId) return;

    try {
      await deleteSubject.mutateAsync(deletingSubjectId);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeletingSubjectId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingSubjectId(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
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
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subjects</h1>
            <p className="text-muted-foreground">Manage your courses and track attendance</p>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-subject">
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {subjectsWithAttendance.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No subjects added yet</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectsWithAttendance.map((subject) => (
              <SubjectCard
                key={subject.id}
                {...subject}
                onEdit={() => handleOpenDialog(subject)}
                onDelete={() => openDeleteDialog(subject.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-add-subject">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
            <DialogDescription>
              {editingSubject ? "Update subject details" : "Create a new subject to track attendance"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="Data Structures"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-subject-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                placeholder="CS201"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                data-testid="input-subject-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Instructor</Label>
              <Input
                id="teacher"
                placeholder="Dr. Sarah Johnson"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                data-testid="input-subject-teacher"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                data-testid="input-subject-color"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createSubject.isPending || updateSubject.isPending}
              data-testid="button-submit-subject"
            >
              {editingSubject ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject and all associated lectures.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
