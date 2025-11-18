import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { WeeklySchedule, InsertWeeklySchedule } from "@shared/schema";

export function useWeeklySchedules(subjectId?: string) {
  const { userId } = useAuth()
  return useQuery<WeeklySchedule[]>({
    queryKey: subjectId ? ["/api/weekly-schedules", { subjectId }] : ["/api/weekly-schedules"],
    queryFn: async () => {
      try {
        if (supabase && userId) {
          let query = supabase.from('weekly_schedules').select('*').eq('user_id', userId)
          if (subjectId) query = query.eq('subject_id', subjectId)
          const { data, error } = await query.order('weekday')
          if (error) throw error
          return (data || []).map((s: any) => ({ id: s.id, subjectId: s.subject_id, weekday: s.weekday, startTime: s.start_time, endTime: s.end_time, title: s.title })) as WeeklySchedule[]
        }
        const url = subjectId ? `/api/weekly-schedules?subjectId=${subjectId}` : "/api/weekly-schedules";
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch weekly schedules:", res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching weekly schedules:", error);
        return [];
      }
    },
    initialData: [],
  });
}

export function useWeeklySchedule(id: string) {
  return useQuery<WeeklySchedule>({
    queryKey: ["/api/weekly-schedules", id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/weekly-schedules/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch weekly schedule: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching weekly schedule:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useCreateWeeklySchedule() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async (data: InsertWeeklySchedule) => {
      if (supabase && userId) {
        const { data: created, error } = await supabase.from('weekly_schedules').insert({
          user_id: userId,
          subject_id: data.subjectId,
          weekday: data.weekday,
          start_time: data.startTime,
          end_time: data.endTime,
          title: data.title,
        }).select('*').single()
        if (error) throw error
        return { id: created.id, subjectId: created.subject_id, weekday: created.weekday, startTime: created.start_time, endTime: created.end_time, title: created.title } as WeeklySchedule
      }
      return apiRequest<WeeklySchedule>("/api/weekly-schedules", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useUpdateWeeklySchedule() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertWeeklySchedule> }) => {
      if (supabase && userId) {
        const payload: any = {}
        if (data.subjectId !== undefined) payload.subject_id = data.subjectId
        if (data.weekday !== undefined) payload.weekday = data.weekday
        if (data.startTime !== undefined) payload.start_time = data.startTime
        if (data.endTime !== undefined) payload.end_time = data.endTime
        if (data.title !== undefined) payload.title = data.title
        const { data: updated, error } = await supabase.from('weekly_schedules').update(payload).eq('id', id).eq('user_id', userId).select('*').single()
        if (error) throw error
        return { id: updated.id, subjectId: updated.subject_id, weekday: updated.weekday, startTime: updated.start_time, endTime: updated.end_time, title: updated.title } as WeeklySchedule
      }
      return apiRequest<WeeklySchedule>(`/api/weekly-schedules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useDeleteWeeklySchedule() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      if (supabase && userId) {
        const { error } = await supabase.from('weekly_schedules').delete().eq('id', id).eq('user_id', userId)
        if (error) throw error
        return { ok: true }
      }
      return apiRequest(`/api/weekly-schedules/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

