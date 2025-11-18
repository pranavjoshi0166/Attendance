import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull(),
  teacher: text("teacher"),
  color: text("color").notNull(),
});

export const lectures = pgTable("lectures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  notes: text("notes"),
  status: text("status"),
  attendanceNote: text("attendance_note"),
  scheduleId: varchar("schedule_id"),
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
}).extend({
  teacher: z.string().optional().nullable(),
  color: z.string().default("#0ea5a0"),
});

export const weeklySchedules = pgTable("weekly_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull(),
  weekday: integer("weekday").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  title: text("title").notNull(),
});

export const insertLectureSchema = createInsertSchema(lectures).omit({
  id: true,
}).extend({
  scheduleId: z.string().optional().nullable(),
});

export const insertWeeklyScheduleSchema = createInsertSchema(weeklySchedules).omit({
  id: true,
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time"),
  priority: text("priority"), // "low", "medium", "high"
  completed: text("completed").default("false"), // "true" or "false"
  subjectId: varchar("subject_id"), // Optional link to subject
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
}).extend({
  completed: z.string().optional().default("false"),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  description: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
});

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Lecture = typeof lectures.$inferSelect;

export type InsertWeeklySchedule = z.infer<typeof insertWeeklyScheduleSchema>;
export type WeeklySchedule = typeof weeklySchedules.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
