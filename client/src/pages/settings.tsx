import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { useSubjects } from "@/hooks/use-subjects";
import { useLectures } from "@/hooks/use-lectures";
import { useWeeklySchedules } from "@/hooks/use-weekly-schedules";
import { useStatistics } from "@/hooks/use-statistics";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react";
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
import { format } from "date-fns";

export default function Settings() {
  const [threshold, setThreshold] = useState(() => {
    const saved = localStorage.getItem("attendanceThreshold");
    return saved ? parseInt(saved, 10) : 75;
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("attendanceNotifications");
    return saved ? saved === "true" : true;
  });
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const { data: subjects = [] } = useSubjects();
  const { data: lectures = [] } = useLectures();
  const { data: weeklySchedules = [] } = useWeeklySchedules();
  const { data: stats } = useStatistics();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("attendanceThreshold", threshold.toString());
  }, [threshold]);

  useEffect(() => {
    localStorage.setItem("attendanceNotifications", notifications.toString());
  }, [notifications]);

  // Check if attendance is below threshold
  useEffect(() => {
    if (notifications && stats && stats.attendancePercentage < threshold && stats.totalLectures > 0) {
      toast({
        title: "Attendance Alert",
        description: `Your attendance (${stats.attendancePercentage.toFixed(1)}%) is below the threshold (${threshold}%)`,
        variant: "destructive",
      });
    }
  }, [stats, threshold, notifications, toast]);

  const handleExportData = () => {
    try {
      const exportData = {
        exportDate: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        subjects,
        lectures,
        weeklySchedules,
        settings: {
          threshold,
          notifications,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendancemate-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.subjects || !Array.isArray(data.subjects)) {
        throw new Error("Invalid data format");
      }

      // Import subjects
      for (const subject of data.subjects) {
        await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subject),
        }).catch(() => {});
      }

      // Import weekly schedules
      if (data.weeklySchedules && Array.isArray(data.weeklySchedules)) {
        for (const schedule of data.weeklySchedules) {
          await fetch("/api/weekly-schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(schedule),
          }).catch(() => {});
        }
      }

      // Import lectures
      if (data.lectures && Array.isArray(data.lectures)) {
        for (const lecture of data.lectures) {
          await fetch("/api/lectures", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lecture),
          }).catch(() => {});
        }
      }

      // Import settings
      if (data.settings) {
        if (data.settings.threshold) setThreshold(data.settings.threshold);
        if (data.settings.notifications !== undefined) setNotifications(data.settings.notifications);
      }

      toast({
        title: "Success",
        description: "Data imported successfully. Please refresh the page.",
      });

      // Reset file input
      event.target.value = "";
      
      // Refresh page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
      event.target.value = "";
    }
  };

  const handleResetData = async () => {
    try {
      // Delete all subjects (cascades to lectures and schedules)
      for (const subject of subjects) {
        await fetch(`/api/subjects/${subject.id}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      // Delete all weekly schedules
      for (const schedule of weeklySchedules) {
        await fetch(`/api/weekly-schedules/${schedule.id}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      // Delete all lectures
      for (const lecture of lectures) {
        await fetch(`/api/lectures/${lecture.id}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      setIsResetDialogOpen(false);
      
      toast({
        title: "Success",
        description: "All data has been reset. Refreshing page...",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your AttendanceMate experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how AttendanceMate looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Alerts</CardTitle>
            <CardDescription>Configure attendance threshold notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Alert Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                min="0"
                max="100"
                data-testid="input-threshold"
              />
              <p className="text-sm text-muted-foreground">
                You'll be notified when attendance falls below {threshold}%
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive attendance alerts</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Backup and export your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Data (JSON)
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => document.getElementById("import-input")?.click()}
              data-testid="button-import-data"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <input
              id="import-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setIsResetDialogOpen(true)}
              data-testid="button-reset-data"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your subjects, lectures, and schedules. 
                This action cannot be undone. Make sure you have exported your data before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
