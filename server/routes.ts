

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubjectSchema, insertLectureSchema, insertWeeklyScheduleSchema, insertTaskSchema } from "@shared/schema";
import type { Lecture } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const clients = new Set<any>()
  const broadcast = (payload: any) => {
    const data = `data: ${JSON.stringify(payload)}\n\n`
    clients.forEach((res) => {
      try {
        res.write(data)
      } catch {}
    })
  }

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
    clients.add(res)
    req.on('close', () => {
      clients.delete(res)
    })
  })
  app.get('/api/subjects', async (_req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  })

  // Lecture routes
  app.get("/api/lectures", async (req, res) => {
    try {
      const { subjectId } = req.query;
      let lectures;
      if (subjectId && typeof subjectId === "string") {
        lectures = await storage.getLecturesBySubject(subjectId);
      } else {
        lectures = await storage.getAllLectures();
      }
      const subjects = await storage.getAllSubjects();
      const byId = new Map(subjects.map(s => [s.id, s]))
      const joined = lectures.map(l => {
        const s = byId.get(l.subjectId)
        return {
          ...l,
          subjectName: s?.name || null,
          subjectCode: s?.code || null,
          subjectColor: s?.color || null,
        }
      })
      res.json(joined);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lectures" });
    }
  });

  app.get("/api/lectures/:id", async (req, res) => {
    try {
      const lecture = await storage.getLecture(req.params.id);
      if (!lecture) {
        return res.status(404).json({ error: "Lecture not found" });
      }
      res.json(lecture);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lecture" });
    }
  });

  app.post("/api/lectures", async (req, res) => {
    try {
      const validated = insertLectureSchema.parse(req.body);
      const lecture = await storage.createLecture(validated);
      res.status(201).json(lecture);
      broadcast({ type: 'lectures' })
    } catch (error: any) {
      console.error("Error creating lecture:", error);
      if (error.errors) {
        res.status(400).json({ 
          error: "Validation error", 
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(400).json({ 
          error: error.message || "Invalid lecture data",
          details: error.toString()
        });
      }
    }
  });

  app.put("/api/lectures/:id", async (req, res) => {
    try {
      const validated = insertLectureSchema.partial().parse(req.body);
      const lecture = await storage.updateLecture(req.params.id, validated);
      if (!lecture) {
        return res.status(404).json({ error: "Lecture not found" });
      }
      res.json(lecture);
      broadcast({ type: 'lectures' })
    } catch (error: any) {
      console.error("Error updating lecture:", error);
      if (error.errors) {
        res.status(400).json({ 
          error: "Validation error", 
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(400).json({ 
          error: error.message || "Invalid lecture data",
          details: error.toString()
        });
      }
    }
  });

  app.delete("/api/lectures/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLecture(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Lecture not found" });
      }
      res.status(204).send();
      broadcast({ type: 'lectures' })
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lecture" });
    }
  });

  // Weekly Schedule routes
  app.get("/api/weekly-schedules", async (req, res) => {
    try {
      const { subjectId } = req.query;
      let schedules;
      if (subjectId && typeof subjectId === "string") {
        schedules = await storage.getWeeklySchedulesBySubject(subjectId);
      } else {
        schedules = await storage.getAllWeeklySchedules();
      }
      const subjects = await storage.getAllSubjects();
      const byId = new Map(subjects.map(s => [s.id, s]))
      const joined = schedules.map(sch => {
        const s = byId.get(sch.subjectId)
        return {
          ...sch,
          subjectName: s?.name || null,
          subjectCode: s?.code || null,
          subjectColor: s?.color || null,
        }
      })
      res.json(joined);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly schedules" });
    }
  });

  app.get("/api/weekly-schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.getWeeklySchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ error: "Weekly schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly schedule" });
    }
  });

  app.post("/api/weekly-schedules", async (req, res) => {
    try {
      const validated = insertWeeklyScheduleSchema.parse(req.body);
      const schedule = await storage.createWeeklySchedule(validated);
      res.status(201).json(schedule);
      broadcast({ type: 'weekly-schedules' })
    } catch (error: any) {
      console.error("Error creating weekly schedule:", error);
      if (error.errors) {
        res.status(400).json({ 
          error: "Validation error", 
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(400).json({ 
          error: error.message || "Invalid weekly schedule data",
          details: error.toString()
        });
      }
    }
  });

  app.put("/api/weekly-schedules/:id", async (req, res) => {
    try {
      const validated = insertWeeklyScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateWeeklySchedule(req.params.id, validated);
      if (!schedule) {
        return res.status(404).json({ error: "Weekly schedule not found" });
      }
      res.json(schedule);
      broadcast({ type: 'weekly-schedules' })
    } catch (error: any) {
      console.error("Error updating weekly schedule:", error);
      if (error.errors) {
        res.status(400).json({ 
          error: "Validation error", 
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(400).json({ 
          error: error.message || "Invalid weekly schedule data",
          details: error.toString()
        });
      }
    }
  });

  app.delete("/api/weekly-schedules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWeeklySchedule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Weekly schedule not found" });
      }
      res.status(204).send();
      broadcast({ type: 'weekly-schedules' })
    } catch (error) {
      res.status(500).json({ error: "Failed to delete weekly schedule" });
    }
  });

  // Generate lectures from schedules
  app.post("/api/weekly-schedules/generate", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const generated = await storage.generateLecturesFromSchedules(startDate, endDate);
      res.json({ generated: generated.length, lectures: generated });
      broadcast({ type: 'lectures' })
    } catch (error) {
      res.status(500).json({ error: "Failed to generate lectures" });
    }
  });

  // Statistics endpoint for dashboard
  app.get("/api/statistics", async (req, res) => {
    try {
      const lectures = await storage.getAllLectures();
      const subjects = await storage.getAllSubjects();
      
      const totalLectures = lectures.length;
      const attendedLectures = lectures.filter((l: Lecture) => l.status === "present" || l.status === "late").length;
      const missedLectures = lectures.filter((l: Lecture) => l.status === "absent").length;
      const attendancePercentage = totalLectures > 0 
        ? Math.round((attendedLectures / totalLectures) * 100 * 10) / 10 
        : 0;

      const breakdown = {
        present: lectures.filter((l: Lecture) => l.status === "present").length,
        absent: lectures.filter((l: Lecture) => l.status === "absent").length,
        late: lectures.filter((l: Lecture) => l.status === "late").length,
        excused: lectures.filter((l: Lecture) => l.status === "excused").length,
      };

      res.json({
        totalLectures,
        attendedLectures,
        missedLectures,
        attendancePercentage,
        breakdown,
        subjects: subjects.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { date } = req.query;
      let tasks;
      if (date && typeof date === "string") {
        tasks = await storage.getTasksByDate(date);
      } else {
        tasks = await storage.getAllTasks();
      }
      const subjects = await storage.getAllSubjects();
      const byId = new Map(subjects.map(s => [s.id, s]))
      const joined = tasks.map(t => {
        const s = t.subjectId ? byId.get(t.subjectId) : undefined
        return {
          ...t,
          subjectName: s?.name || null,
          subjectCode: s?.code || null,
          subjectColor: s?.color || null,
        }
      })
      res.json(joined);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      // Clean and validate input data
      const cleanedData: any = {
        title: req.body.title?.trim() || "",
        date: req.body.date || "",
        completed: req.body.completed || "false",
        description: req.body.description?.trim() || null,
        time: req.body.time?.trim() || null,
        priority: req.body.priority || null,
        subjectId: req.body.subjectId?.trim() || null,
      };

      // Validate required fields
      if (!cleanedData.title || !cleanedData.date) {
        return res.status(400).json({
          error: "Validation error",
          details: "Title and date are required fields"
        });
      }

      const validated = insertTaskSchema.parse(cleanedData);
      
      const task = await storage.createTask(validated);
      res.status(201).json(task);
      broadcast({ type: 'tasks' })
    } catch (error: any) {
      console.error("Error creating task:", error);
      if (error.errors) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(400).json({
          error: error.message || "Invalid task data",
          details: error.toString()
        });
      }
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const validated = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validated);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
      broadcast({ type: 'tasks' })
    } catch (error: any) {
      console.error("Error updating task:", error);
      if (error.errors) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      } else {
        res.status(400).json({
          error: error.message || "Invalid task data",
          details: error.toString()
        });
      }
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
      broadcast({ type: 'tasks' })
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
