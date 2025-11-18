import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Lecture, InsertLecture } from "@shared/schema";

export function useLectures(subjectId?: string) {
  const { userId } = useAuth()
  return useQuery<Lecture[]>({
    queryKey: subjectId ? ["/api/lectures", { subjectId }] : ["/api/lectures"],
    queryFn: async () => {
      try {
        if (supabase && userId) {
          let query = supabase.from('lectures').select('*').eq('user_id', userId)
          if (subjectId) query = query.eq('subject_id', subjectId)
          const { data, error } = await query.order('date', { ascending: true })
          if (error) throw error
          return (data || []).map((l: any) => ({
            id: l.id,
            subjectId: l.subject_id,
            title: l.title,
            date: l.date,
            startTime: l.start_time,
            endTime: l.end_time,
            notes: l.notes,
            status: l.status,
            attendanceNote: l.attendance_note,
          })) as Lecture[]
        }
        const url = subjectId ? `/api/lectures?subjectId=${subjectId}` : "/api/lectures";
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch lectures:", res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching lectures:", error);
        return [];
      }
    },
    initialData: [],
  });
}

export function useLecture(id: string) {
  return useQuery<Lecture>({
    queryKey: ["/api/lectures", id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/lectures/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch lecture: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching lecture:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useCreateLecture() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async (data: InsertLecture) => {
      if (supabase && userId) {
        const { data: created, error } = await supabase.from('lectures').insert({
          user_id: userId,
          subject_id: data.subjectId,
          title: data.title,
          date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
          notes: data.notes,
          status: data.status,
          attendance_note: data.attendanceNote,
        }).select('*').single()
        if (error) throw error
        return {
          id: created.id,
          subjectId: created.subject_id,
          title: created.title,
          date: created.date,
          startTime: created.start_time,
          endTime: created.end_time,
          notes: created.notes,
          status: created.status,
          attendanceNote: created.attendance_note,
        } as Lecture
      }
      return apiRequest<Lecture>("/api/lectures", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useUpdateLecture() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertLecture> }) => {
      if (supabase && userId) {
        const payload: any = {}
        if (data.subjectId !== undefined) payload.subject_id = data.subjectId
        if (data.title !== undefined) payload.title = data.title
        if (data.date !== undefined) payload.date = data.date
        if (data.startTime !== undefined) payload.start_time = data.startTime
        if (data.endTime !== undefined) payload.end_time = data.endTime
        if (data.notes !== undefined) payload.notes = data.notes
        if (data.status !== undefined) payload.status = data.status
        if (data.attendanceNote !== undefined) payload.attendance_note = data.attendanceNote
        const { data: updated, error } = await supabase.from('lectures').update(payload).eq('id', id).eq('user_id', userId).select('*').single()
        if (error) throw error
        return {
          id: updated.id,
          subjectId: updated.subject_id,
          title: updated.title,
          date: updated.date,
          startTime: updated.start_time,
          endTime: updated.end_time,
          notes: updated.notes,
          status: updated.status,
          attendanceNote: updated.attendance_note,
        } as Lecture
      }
      return apiRequest<Lecture>(`/api/lectures/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useDeleteLecture() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      if (supabase && userId) {
        const { error } = await supabase.from('lectures').delete().eq('id', id).eq('user_id', userId)
        if (error) throw error
        return { ok: true }
      }
      return apiRequest(`/api/lectures/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}
