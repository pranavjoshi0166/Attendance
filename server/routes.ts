import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubjectSchema, insertLectureSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validated = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validated);
      res.status(201).json(subject);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const validated = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(req.params.id, validated);
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

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
      res.json(lectures);
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
    } catch (error) {
      res.status(400).json({ error: "Invalid lecture data" });
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
    } catch (error) {
      res.status(400).json({ error: "Invalid lecture data" });
    }
  });

  app.delete("/api/lectures/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLecture(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Lecture not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lecture" });
    }
  });

  // Statistics endpoint for dashboard
  app.get("/api/statistics", async (req, res) => {
    try {
      const lectures = await storage.getAllLectures();
      const subjects = await storage.getAllSubjects();
      
      const totalLectures = lectures.length;
      const attendedLectures = lectures.filter(l => l.status === "present" || l.status === "late").length;
      const missedLectures = lectures.filter(l => l.status === "absent").length;
      const attendancePercentage = totalLectures > 0 
        ? Math.round((attendedLectures / totalLectures) * 100 * 10) / 10 
        : 0;

      const breakdown = {
        present: lectures.filter(l => l.status === "present").length,
        absent: lectures.filter(l => l.status === "absent").length,
        late: lectures.filter(l => l.status === "late").length,
        excused: lectures.filter(l => l.status === "excused").length,
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

  const httpServer = createServer(app);
  return httpServer;
}
