import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Task, InsertTask } from "@shared/schema";

export function useTasks(date?: string) {
  return useQuery<Task[]>({
    queryKey: date ? ["/api/tasks", { date }] : ["/api/tasks"],
    queryFn: async () => {
      try {
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
  return useMutation({
    mutationFn: async (data: InsertTask) => {
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
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTask> }) => {
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
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

