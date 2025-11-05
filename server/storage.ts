import { type Subject, type InsertSubject, type Lecture, type InsertLecture } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Subject operations
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;

  // Lecture operations
  getAllLectures(): Promise<Lecture[]>;
  getLecture(id: string): Promise<Lecture | undefined>;
  getLecturesBySubject(subjectId: string): Promise<Lecture[]>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  updateLecture(id: string, lecture: Partial<InsertLecture>): Promise<Lecture | undefined>;
  deleteLecture(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private subjects: Map<string, Subject>;
  private lectures: Map<string, Lecture>;

  constructor() {
    this.subjects = new Map();
    this.lectures = new Map();
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, updates: Partial<InsertSubject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;
    const updated = { ...subject, ...updates };
    this.subjects.set(id, updated);
    return updated;
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Lecture operations
  async getAllLectures(): Promise<Lecture[]> {
    return Array.from(this.lectures.values());
  }

  async getLecture(id: string): Promise<Lecture | undefined> {
    return this.lectures.get(id);
  }

  async getLecturesBySubject(subjectId: string): Promise<Lecture[]> {
    return Array.from(this.lectures.values()).filter(
      (lecture) => lecture.subjectId === subjectId
    );
  }

  async createLecture(insertLecture: InsertLecture): Promise<Lecture> {
    const id = randomUUID();
    const lecture: Lecture = { ...insertLecture, id };
    this.lectures.set(id, lecture);
    return lecture;
  }

  async updateLecture(id: string, updates: Partial<InsertLecture>): Promise<Lecture | undefined> {
    const lecture = this.lectures.get(id);
    if (!lecture) return undefined;
    const updated = { ...lecture, ...updates };
    this.lectures.set(id, updated);
    return updated;
  }

  async deleteLecture(id: string): Promise<boolean> {
    return this.lectures.delete(id);
  }
}

export const storage = new MemStorage();
