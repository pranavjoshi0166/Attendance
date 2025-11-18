import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubjectCardProps {
  id: string;
  name: string;
  code: string;
  teacher: string | null;
  attendancePercentage: number;
  color: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SubjectCard({
  id,
  name,
  code,
  teacher,
  attendancePercentage,
  color,
  onEdit,
  onDelete,
}: SubjectCardProps) {
  return (
    <Card
      className="hover-elevate border-l-4"
      style={{ borderLeftColor: color }}
      data-testid={`card-subject-${id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1">{name}</h3>
          <Badge variant="secondary" className="text-xs">
            {code}
          </Badge>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onEdit}
            data-testid={`button-edit-subject-${id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onDelete}
            data-testid={`button-delete-subject-${id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Instructor: {teacher}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Attendance</span>
          <span
            className="text-2xl font-bold"
            style={{ color: attendancePercentage >= 75 ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)" }}
          >
            {attendancePercentage}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
