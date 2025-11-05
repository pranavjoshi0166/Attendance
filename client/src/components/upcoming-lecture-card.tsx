import { Card, CardContent } from "@/components/ui/card";
import { Clock, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UpcomingLectureCardProps {
  title: string;
  subject: string;
  time: string;
  date: string;
  subjectColor?: string;
}

export function UpcomingLectureCard({
  title,
  subject,
  time,
  date,
  subjectColor = "hsl(174, 65%, 41%)",
}: UpcomingLectureCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-lecture-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${subjectColor}20` }}
            >
              <Clock className="w-5 h-5" style={{ color: subjectColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {date}, {time}
              </p>
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${subjectColor}15`,
                  color: subjectColor,
                }}
              >
                {subject}
              </Badge>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 flex-shrink-0"
            data-testid={`button-lecture-menu-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
