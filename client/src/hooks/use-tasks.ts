import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Task, InsertTask } from "@shared/schema";

export function useTasks(date?: string) {
  const { userId } = useAuth()
  return useQuery<Task[]>({
    queryKey: date ? ["/api/tasks", { date }] : ["/api/tasks"],
    queryFn: async () => {
      try {
        if (supabase && userId) {
          let query = supabase.from('tasks').select('*').eq('user_id', userId)
          if (date) query = query.eq('date', date)
          const { data, error } = await query.order('date', { ascending: true })
          if (error) throw error
          return (data || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            date: t.date,
            time: t.time,
            priority: t.priority,
            completed: t.completed ? 'true' : 'false',
            subjectId: t.subject_id || null,
          })) as Task[]
        }
        const url = date ? `/api/tasks?date=${date}` : "/api/tasks";
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch tasks:", res.status, res.statusText);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
    initialData: [],
  });
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ["/api/tasks", id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch task: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching task:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async (data: InsertTask) => {
      if (supabase && userId) {
        const { data: created, error } = await supabase.from('tasks').insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          priority: data.priority,
          completed: (data.completed || 'false') === 'true',
          subject_id: data.subjectId,
        }).select('*').single()
        if (error) throw error
        return {
          id: created.id,
          title: created.title,
          description: created.description,
          date: created.date,
          time: created.time,
          priority: created.priority,
          completed: created.completed ? 'true' : 'false',
          subjectId: created.subject_id || null,
        } as Task
      }
      return apiRequest<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useUpdateTask() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTask> }) => {
      if (supabase && userId) {
        const payload: any = {}
        if (data.title !== undefined) payload.title = data.title
        if (data.description !== undefined) payload.description = data.description
        if (data.date !== undefined) payload.date = data.date
        if (data.time !== undefined) payload.time = data.time
        if (data.priority !== undefined) payload.priority = data.priority
        if (data.completed !== undefined) payload.completed = data.completed === 'true'
        if (data.subjectId !== undefined) payload.subject_id = data.subjectId
        const { data: updated, error } = await supabase.from('tasks').update(payload).eq('id', id).eq('user_id', userId).select('*').single()
        if (error) throw error
        return {
          id: updated.id,
          title: updated.title,
          description: updated.description,
          date: updated.date,
          time: updated.time,
          priority: updated.priority,
          completed: updated.completed ? 'true' : 'false',
          subjectId: updated.subject_id || null,
        } as Task
      }
      return apiRequest<Task>(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useDeleteTask() {
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      if (supabase && userId) {
        const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
        if (error) throw error
        return { ok: true }
      }
      return apiRequest(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/tasks"] })
      const prev = queryClient.getQueryData(["/api/tasks"])
      queryClient.setQueryData(["/api/tasks"], (old: any) => Array.isArray(old) ? old.filter((t) => t?.id !== id) : old)
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["/api/tasks"], ctx.prev as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

