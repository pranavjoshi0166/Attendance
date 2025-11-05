import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSubjects } from "@/hooks/use-subjects";
import { useLectures } from "@/hooks/use-lectures";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");

  const { data: subjects = [] } = useSubjects();
  const { data: lectures = [], isLoading } = useLectures();
  const { toast } = useToast();

  const filteredLectures = useMemo(() => {
    return lectures
      .filter(lecture => {
        // Filter by attendance status (only show lectures with marked attendance)
        if (!lecture.status) return false;

        // Filter by subject
        if (selectedSubjectId !== "all" && lecture.subjectId !== selectedSubjectId) {
          return false;
        }

        // Filter by date range
        if (startDate && lecture.date < startDate) return false;
        if (endDate && lecture.date > endDate) return false;

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [lectures, selectedSubjectId, startDate, endDate]);

  const reportData = useMemo(() => {
    return filteredLectures.map(lecture => {
      const subject = subjects.find(s => s.id === lecture.subjectId);
      return {
        date: lecture.date,
        subjectCode: subject?.code || "N/A",
        subjectName: subject?.name || "Unknown",
        lecture: lecture.title,
        status: lecture.status || "unknown",
        startTime: lecture.startTime,
        endTime: lecture.endTime,
      };
    });
  }, [filteredLectures, subjects]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; bg: string }> = {
      present: { color: "hsl(142, 76%, 36%)", bg: "hsl(142, 76%, 95%)" },
      absent: { color: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 95%)" },
      late: { color: "hsl(45, 93%, 47%)", bg: "hsl(45, 93%, 95%)" },
      excused: { color: "hsl(217, 91%, 60%)", bg: "hsl(217, 91%, 95%)" },
    };

    const variant = variants[status] || variants.present;

    return (
      <Badge
        variant="secondary"
        style={{ backgroundColor: variant.bg, color: variant.color }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExportPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF export functionality will be available soon",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Coming Soon",
      description: "Excel export functionality will be available soon",
    });
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">Generate and export attendance reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-subject">Subject</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                  <SelectTrigger id="filter-subject" data-testid="select-filter-subject">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleExportPDF} data-testid="button-export-pdf">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel} data-testid="button-export-excel">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Attendance Records</CardTitle>
              <p className="text-sm text-muted-foreground">
                {reportData.length} {reportData.length === 1 ? "record" : "records"} found
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No attendance records found for the selected filters
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Lecture</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((record, index) => (
                    <TableRow key={index} data-testid={`row-report-${index}`}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.subjectCode}</div>
                          <div className="text-xs text-muted-foreground">{record.subjectName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.lecture}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.startTime} - {record.endTime}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
