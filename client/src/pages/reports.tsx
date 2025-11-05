import { useState } from "react";
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

//todo: remove mock functionality
const mockReportData = [
  { date: "2025-01-15", subject: "CS201", lecture: "Binary Trees", status: "present" },
  { date: "2025-01-16", subject: "CS301", lecture: "TCP/IP Protocol", status: "present" },
  { date: "2025-01-17", subject: "CS202", lecture: "SQL Joins", status: "absent" },
  { date: "2025-01-18", subject: "CS302", lecture: "Process Scheduling", status: "present" },
  { date: "2025-01-19", subject: "CS201", lecture: "AVL Trees", status: "late" },
];

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    console.log("Export to PDF triggered");
  };

  const handleExportExcel = () => {
    console.log("Export to Excel triggered");
  };

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
                <Select>
                  <SelectTrigger id="filter-subject" data-testid="select-filter-subject">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="cs201">Data Structures (CS201)</SelectItem>
                    <SelectItem value="cs301">Computer Networks (CS301)</SelectItem>
                    <SelectItem value="cs202">Database Systems (CS202)</SelectItem>
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
            <CardTitle className="text-lg font-semibold">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Lecture</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReportData.map((record, index) => (
                  <TableRow key={index} data-testid={`row-report-${index}`}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.lecture}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
