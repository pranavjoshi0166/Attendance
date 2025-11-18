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
import { useStatistics } from "@/hooks/use-statistics";
import { useToast } from "@/hooks/use-toast";
import { AttendanceChart } from "@/components/attendance-chart";
import { AttendanceLineChart } from "@/components/attendance-line-chart";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");

  const { data: subjects = [] } = useSubjects();
  const { data: lectures = [], isLoading } = useLectures();
  const { data: stats } = useStatistics();
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

  const attendanceData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Present", value: stats.breakdown.present, color: "#22c55e" },
      { name: "Absent", value: stats.breakdown.absent, color: "#ef4444" },
      { name: "Late", value: stats.breakdown.late, color: "#f59e0b" },
      { name: "Excused", value: stats.breakdown.excused, color: "#3b82f6" },
    ];
  }, [stats]);

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      pdf.setFontSize(18);
      pdf.text("Attendance Report", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      // Date range
      pdf.setFontSize(12);
      const dateRange = startDate && endDate 
        ? `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`
        : "All Time";
      pdf.text(`Period: ${dateRange}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Summary stats
      if (stats) {
        pdf.setFontSize(14);
        pdf.text("Summary Statistics", 20, yPos);
        yPos += 8;
        pdf.setFontSize(11);
        pdf.text(`Overall Attendance: ${stats.attendancePercentage.toFixed(1)}%`, 20, yPos);
        yPos += 6;
        pdf.text(`Total Lectures: ${stats.totalLectures}`, 20, yPos);
        yPos += 6;
        pdf.text(`Attended: ${stats.attendedLectures}`, 20, yPos);
        yPos += 6;
        pdf.text(`Missed: ${stats.missedLectures}`, 20, yPos);
        yPos += 10;
      }

      // Table header
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Date", 20, yPos);
      pdf.text("Subject", 50, yPos);
      pdf.text("Lecture", 90, yPos);
      pdf.text("Status", 150, yPos);
      yPos += 6;

      // Table rows
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      reportData.slice(0, 20).forEach((record) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(record.date, 20, yPos);
        pdf.text(record.subjectCode, 50, yPos);
        const lectureText = record.lecture.length > 25 ? record.lecture.substring(0, 22) + "..." : record.lecture;
        pdf.text(lectureText, 90, yPos);
        pdf.text(record.status.charAt(0).toUpperCase() + record.status.slice(1), 150, yPos);
        yPos += 6;
      });

      if (reportData.length > 20) {
        pdf.text(`... and ${reportData.length - 20} more records`, 20, yPos);
      }

      // Export chart if available
      if (attendanceData.length > 0 && attendanceData.some(d => d.value > 0)) {
        try {
          const chartElement = document.getElementById("attendance-chart-export");
          if (chartElement) {
            const canvas = await html2canvas(chartElement, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.text("Attendance Breakdown", pageWidth / 2, 20, { align: "center" });
            const imgWidth = pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 20, 30, imgWidth, Math.min(imgHeight, 150));
          }
        } catch (err) {
          console.error("Error exporting chart:", err);
        }
      }

      pdf.save(`attendance-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      
      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
    toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
    });
    }
  };

  const handleExportExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = reportData.map((record) => ({
        Date: record.date,
        "Subject Code": record.subjectCode,
        "Subject Name": record.subjectName,
        Lecture: record.lecture,
        "Start Time": record.startTime,
        "End Time": record.endTime,
        Status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 12 }, // Date
        { wch: 15 }, // Subject Code
        { wch: 25 }, // Subject Name
        { wch: 30 }, // Lecture
        { wch: 12 }, // Start Time
        { wch: 12 }, // End Time
        { wch: 12 }, // Status
      ];

      // Add summary sheet
      if (stats) {
        const summaryData = [
          ["Summary Statistics"],
          ["Overall Attendance", `${stats.attendancePercentage.toFixed(1)}%`],
          ["Total Lectures", stats.totalLectures],
          ["Attended", stats.attendedLectures],
          ["Missed", stats.missedLectures],
          [],
          ["Breakdown"],
          ["Present", stats.breakdown.present],
          ["Absent", stats.breakdown.absent],
          ["Late", stats.breakdown.late],
          ["Excused", stats.breakdown.excused],
        ];
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
      }

      XLSX.utils.book_append_sheet(wb, ws, "Attendance Records");

      // Export
      XLSX.writeFile(wb, `attendance-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);

      toast({
        title: "Success",
        description: "Excel file exported successfully",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
    toast({
        title: "Error",
        description: "Failed to export Excel file",
        variant: "destructive",
    });
    }
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
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
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
              <div className="overflow-x-auto">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden chart for PDF export */}
        {attendanceData.length > 0 && attendanceData.some(d => d.value > 0) && (
          <div id="attendance-chart-export" className="hidden">
            <AttendanceChart data={attendanceData} />
          </div>
        )}
      </div>
    </div>
  );
}
