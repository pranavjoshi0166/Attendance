import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type {
  Subject,
  InsertSubject,
  Lecture,
  InsertLecture,
  WeeklySchedule,
  InsertWeeklySchedule,
  Task,
  InsertTask,
} from "@shared/schema";

class MemStorage {
  private subjects: Map<string, Subject> = new Map();
  private lectures: Map<string, Lecture> = new Map();
  private weeklySchedules: Map<string, WeeklySchedule> = new Map();
  private tasks: Map<string, Task> = new Map();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    try {
      // Get directory path - handle both import.meta.dirname (Node 20.11+) and import.meta.url
      let __dirname: string;
      if (typeof import.meta.dirname !== 'undefined') {
        __dirname = import.meta.dirname;
      } else {
        const fileUrl = new URL(import.meta.url);
        let filePath = fileUrl.pathname;
        // Handle Windows paths (remove leading slash)
        if (process.platform === 'win32' && filePath.startsWith('/')) {
          filePath = filePath.slice(1);
        }
        __dirname = path.dirname(filePath);
      }
      const dataDir = path.resolve(__dirname, "..", "data");
      
      console.log("Loading data from:", dataDir);

      // Load subjects
      const subjectsPath = path.join(dataDir, "subjects.json");
      if (fs.existsSync(subjectsPath)) {
        const subjectsData = JSON.parse(fs.readFileSync(subjectsPath, "utf-8"));
        const seenCodes = new Set<string>();
        subjectsData.forEach((subject: Subject) => {
          const codeKey = (subject.code || "").trim().toLowerCase();
          if (codeKey && seenCodes.has(codeKey)) {
            return; // drop duplicate by code
          }
          if (codeKey) seenCodes.add(codeKey);
          this.subjects.set(subject.id, subject);
        });
      }

      // Load lectures
      const lecturesPath = path.join(dataDir, "lectures.json");
      if (fs.existsSync(lecturesPath)) {
        const lecturesData = JSON.parse(fs.readFileSync(lecturesPath, "utf-8"));
        lecturesData.forEach((lecture: Lecture) => {
          this.lectures.set(lecture.id, lecture);
        });
      }

      // Load weekly schedules
      const schedulesPath = path.join(dataDir, "weeklySchedules.json");
      if (fs.existsSync(schedulesPath)) {
        const schedulesData = JSON.parse(fs.readFileSync(schedulesPath, "utf-8"));
        schedulesData.forEach((schedule: WeeklySchedule) => {
          this.weeklySchedules.set(schedule.id, schedule);
        });
      }

      // Load tasks
      const tasksPath = path.join(dataDir, "tasks.json");
      if (fs.existsSync(tasksPath)) {
        const tasksData = JSON.parse(fs.readFileSync(tasksPath, "utf-8"));
        tasksData.forEach((task: Task) => {
          this.tasks.set(task.id, task);
        });
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }

  private saveToFile() {
    try {
      // Get directory path
      let __dirname: string;
      if (typeof import.meta.dirname !== 'undefined') {
        __dirname = import.meta.dirname;
      } else {
        const fileUrl = new URL(import.meta.url);
        let filePath = fileUrl.pathname;
        if (process.platform === 'win32' && filePath.startsWith('/')) {
          filePath = filePath.slice(1);
        }
        __dirname = path.dirname(filePath);
      }
      const dataDir = path.resolve(__dirname, "..", "data");
      
      // Ensure data directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Save subjects
      fs.writeFileSync(
        path.join(dataDir, "subjects.json"),
        JSON.stringify(Array.from(this.subjects.values()), null, 2),
        "utf-8"
      );

      // Save lectures
      fs.writeFileSync(
        path.join(dataDir, "lectures.json"),
        JSON.stringify(Array.from(this.lectures.values()), null, 2),
        "utf-8"
      );

      // Save weekly schedules
      fs.writeFileSync(
        path.join(dataDir, "weeklySchedules.json"),
        JSON.stringify(Array.from(this.weeklySchedules.values()), null, 2),
        "utf-8"
      );

      // Save tasks
      fs.writeFileSync(
        path.join(dataDir, "tasks.json"),
        JSON.stringify(Array.from(this.tasks.values()), null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  // Subject methods
  
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | null> {
    return this.subjects.get(id) || null;
  }

  async createSubject(data: InsertSubject): Promise<Subject> {
    const codeKey = (data.code || "").trim().toLowerCase();
    if (codeKey) {
      const exists = Array.from(this.subjects.values()).some((s) => (s.code || "").trim().toLowerCase() === codeKey);
      if (exists) {
        throw new Error("Subject code already exists");
      }
    }
    const subject: Subject = {
      id: nanoid(),
      name: data.name,
      code: data.code,
      teacher: data.teacher || null,
      color: data.color || "#0ea5a0",
    };
    this.subjects.set(subject.id, subject);
    this.saveToFile();
    return subject;
  }

  async updateSubject(id: string, data: Partial<InsertSubject>): Promise<Subject | null> {
    const existing = this.subjects.get(id);
    if (!existing) return null;

    if (data.code !== undefined) {
      const codeKey = (data.code || "").trim().toLowerCase();
      const conflict = Array.from(this.subjects.values()).some((s) => s.id !== id && (s.code || "").trim().toLowerCase() === codeKey);
      if (conflict) {
        throw new Error("Subject code already exists");
      }
    }

    const updated: Subject = {
      ...existing,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.teacher !== undefined && { teacher: data.teacher || null }),
      ...(data.color !== undefined && { color: data.color }),
    };
    this.subjects.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = this.subjects.delete(id);
    if (result) {
      // Cascade: remove lectures and weekly schedules for this subject
      for (const [lecId, lecture] of Array.from(this.lectures.entries())) {
        if (lecture.subjectId === id) {
          this.lectures.delete(lecId)
        }
      }
      for (const [schedId, schedule] of Array.from(this.weeklySchedules.entries())) {
        if (schedule.subjectId === id) {
          this.weeklySchedules.delete(schedId)
        }
      }
      // Tasks: clear subject reference but keep the task
      for (const [taskId, task] of Array.from(this.tasks.entries())) {
        if (task.subjectId === id) {
          this.tasks.set(taskId, { ...task, subjectId: null })
        }
      }
      this.saveToFile();
    }
    return result;
  }

  // Lecture methods
  async getAllLectures(): Promise<Lecture[]> {
    return Array.from(this.lectures.values());
  }

  async getLecture(id: string): Promise<Lecture | null> {
    return this.lectures.get(id) || null;
  }

  async getLecturesBySubject(subjectId: string): Promise<Lecture[]> {
    return Array.from(this.lectures.values()).filter((l) => l.subjectId === subjectId);
  }

  async createLecture(data: InsertLecture): Promise<Lecture> {
    const lecture: Lecture = {
      id: nanoid(),
      subjectId: data.subjectId,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes || null,
      status: data.status || null,
      attendanceNote: data.attendanceNote || null,
    };
    this.lectures.set(lecture.id, lecture);
    this.saveToFile();
    return lecture;
  }

  async updateLecture(id: string, data: Partial<InsertLecture>): Promise<Lecture | null> {
    const existing = this.lectures.get(id);
    if (!existing) return null;

    const updated: Lecture = {
      ...existing,
      ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.status !== undefined && { status: data.status || null }),
      ...(data.attendanceNote !== undefined && { attendanceNote: data.attendanceNote || null }),
    };
    this.lectures.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteLecture(id: string): Promise<boolean> {
    const result = this.lectures.delete(id);
    if (result) this.saveToFile();
    return result;
  }

  // Weekly Schedule methods
  async getAllWeeklySchedules(): Promise<WeeklySchedule[]> {
    return Array.from(this.weeklySchedules.values());
  }

  async getWeeklySchedule(id: string): Promise<WeeklySchedule | null> {
    return this.weeklySchedules.get(id) || null;
  }

  async getWeeklySchedulesBySubject(subjectId: string): Promise<WeeklySchedule[]> {
    return Array.from(this.weeklySchedules.values()).filter((s) => s.subjectId === subjectId);
  }

  async createWeeklySchedule(data: InsertWeeklySchedule): Promise<WeeklySchedule> {
    const schedule: WeeklySchedule = {
      id: nanoid(),
      subjectId: data.subjectId,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
    };
    this.weeklySchedules.set(schedule.id, schedule);
    this.saveToFile();
    return schedule;
  }

  async updateWeeklySchedule(
    id: string,
    data: Partial<InsertWeeklySchedule>
  ): Promise<WeeklySchedule | null> {
    const existing = this.weeklySchedules.get(id);
    if (!existing) return null;

    const updated: WeeklySchedule = {
      ...existing,
      ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
      ...(data.weekday !== undefined && { weekday: data.weekday }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.title !== undefined && { title: data.title }),
    };
    this.weeklySchedules.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteWeeklySchedule(id: string): Promise<boolean> {
    const result = this.weeklySchedules.delete(id);
    if (result) this.saveToFile();
    return result;
  }

  async generateLecturesFromSchedules(startDate: string, endDate: string): Promise<Lecture[]> {
    const generated: Lecture[] = [];
    const startParts = startDate.split('-').map(Number)
    const endParts = endDate.split('-').map(Number)
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2])
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2])
    const schedules = Array.from(this.weeklySchedules.values());

    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      // Find matching schedules for this weekday
      const matchingSchedules = schedules.filter((s) => s.weekday === dayOfWeek);

      for (const schedule of matchingSchedules) {
        // Check if lecture already exists for this schedule on this date
        const existing = Array.from(this.lectures.values()).find(
          (l) => l.subjectId === schedule.subjectId && l.date === dateStr && l.startTime === schedule.startTime && l.endTime === schedule.endTime
        );

        if (!existing) {
          const lecture = await this.createLecture({
            subjectId: schedule.subjectId,
            title: schedule.title,
            date: dateStr,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            notes: null,
            status: null,
            attendanceNote: null,
          });
          generated.push(lecture);
        }
      }
    }

    return generated;
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t) => t.date === date);
  }

  async createTask(data: InsertTask): Promise<Task> {
    const task: Task = {
      id: nanoid(),
      title: data.title,
      description: data.description || null,
      date: data.date,
      time: data.time || null,
      priority: data.priority || null,
      completed: data.completed || "false",
      subjectId: data.subjectId || null,
    };
    this.tasks.set(task.id, task);
    this.saveToFile();
    return task;
  }

  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | null> {
    const existing = this.tasks.get(id);
    if (!existing) return null;

    const updated: Task = {
      ...existing,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.time !== undefined && { time: data.time || null }),
      ...(data.priority !== undefined && { priority: data.priority || null }),
      ...(data.completed !== undefined && { completed: data.completed || "false" }),
      ...(data.subjectId !== undefined && { subjectId: data.subjectId || null }),
    };
    this.tasks.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = this.tasks.delete(id);
    if (result) this.saveToFile();
    return result;
  }
}

export const storage = new MemStorage();
