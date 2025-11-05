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
    this.seedData();
  }

  private seedData() {
    // Sample subjects
    const sampleSubjects: Subject[] = [
      {
        id: "sub1",
        name: "Data Structures",
        code: "CS201",
        teacher: "Dr. Sarah Johnson",
        color: "hsl(174, 65%, 41%)",
      },
      {
        id: "sub2",
        name: "Computer Networks",
        code: "CS301",
        teacher: "Prof. Mike Chen",
        color: "hsl(217, 91%, 60%)",
      },
      {
        id: "sub3",
        name: "Database Systems",
        code: "CS202",
        teacher: "Dr. Emily Brown",
        color: "hsl(45, 93%, 47%)",
      },
      {
        id: "sub4",
        name: "Operating Systems",
        code: "CS302",
        teacher: "Prof. David Lee",
        color: "hsl(142, 76%, 36%)",
      },
    ];

    sampleSubjects.forEach(subject => {
      this.subjects.set(subject.id, subject);
    });

    // Sample lectures (mix of past and upcoming)
    const today = new Date();
    const sampleLectures: Lecture[] = [
      // Past lectures with attendance marked
      {
        id: "lec1",
        subjectId: "sub1",
        title: "Introduction to Arrays",
        date: this.getDateString(-14),
        startTime: "09:00",
        endTime: "10:30",
        notes: "Arrays and basic operations",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec2",
        subjectId: "sub1",
        title: "Linked Lists",
        date: this.getDateString(-13),
        startTime: "09:00",
        endTime: "10:30",
        notes: "Single and doubly linked lists",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec3",
        subjectId: "sub2",
        title: "OSI Model",
        date: this.getDateString(-12),
        startTime: "11:00",
        endTime: "12:30",
        notes: "Network layers",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec4",
        subjectId: "sub3",
        title: "SQL Basics",
        date: this.getDateString(-11),
        startTime: "14:00",
        endTime: "15:30",
        notes: "SELECT, INSERT, UPDATE",
        status: "absent",
        attendanceNote: "Was sick",
      },
      {
        id: "lec5",
        subjectId: "sub1",
        title: "Stacks and Queues",
        date: this.getDateString(-10),
        startTime: "09:00",
        endTime: "10:30",
        notes: "Stack and queue operations",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec6",
        subjectId: "sub4",
        title: "Process Management",
        date: this.getDateString(-9),
        startTime: "10:00",
        endTime: "11:30",
        notes: "Process states and scheduling",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec7",
        subjectId: "sub2",
        title: "TCP/IP Protocol",
        date: this.getDateString(-8),
        startTime: "11:00",
        endTime: "12:30",
        notes: "Transport layer protocols",
        status: "late",
        attendanceNote: "Traffic delay",
      },
      {
        id: "lec8",
        subjectId: "sub3",
        title: "Database Normalization",
        date: this.getDateString(-7),
        startTime: "14:00",
        endTime: "15:30",
        notes: "1NF, 2NF, 3NF",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec9",
        subjectId: "sub1",
        title: "Trees",
        date: this.getDateString(-6),
        startTime: "09:00",
        endTime: "10:30",
        notes: "Binary trees",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec10",
        subjectId: "sub4",
        title: "Memory Management",
        date: this.getDateString(-5),
        startTime: "10:00",
        endTime: "11:30",
        notes: "Virtual memory",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec11",
        subjectId: "sub2",
        title: "HTTP and HTTPS",
        date: this.getDateString(-4),
        startTime: "11:00",
        endTime: "12:30",
        notes: "Application layer protocols",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec12",
        subjectId: "sub3",
        title: "Indexes and Views",
        date: this.getDateString(-3),
        startTime: "14:00",
        endTime: "15:30",
        notes: "Database optimization",
        status: "present",
        attendanceNote: null,
      },
      {
        id: "lec13",
        subjectId: "sub1",
        title: "Graph Algorithms",
        date: this.getDateString(-2),
        startTime: "09:00",
        endTime: "10:30",
        notes: "BFS and DFS",
        status: "absent",
        attendanceNote: "Family emergency",
      },
      {
        id: "lec14",
        subjectId: "sub4",
        title: "File Systems",
        date: this.getDateString(-1),
        startTime: "10:00",
        endTime: "11:30",
        notes: "File allocation methods",
        status: "present",
        attendanceNote: null,
      },
      // Upcoming lectures (no attendance marked)
      {
        id: "lec15",
        subjectId: "sub1",
        title: "Hashing",
        date: this.getDateString(1),
        startTime: "09:00",
        endTime: "10:30",
        notes: "Hash tables and collision resolution",
        status: null,
        attendanceNote: null,
      },
      {
        id: "lec16",
        subjectId: "sub2",
        title: "Network Security",
        date: this.getDateString(2),
        startTime: "11:00",
        endTime: "12:30",
        notes: "Encryption and authentication",
        status: null,
        attendanceNote: null,
      },
      {
        id: "lec17",
        subjectId: "sub3",
        title: "Transactions",
        date: this.getDateString(3),
        startTime: "14:00",
        endTime: "15:30",
        notes: "ACID properties",
        status: null,
        attendanceNote: null,
      },
    ];

    sampleLectures.forEach(lecture => {
      this.lectures.set(lecture.id, lecture);
    });
  }

  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
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
