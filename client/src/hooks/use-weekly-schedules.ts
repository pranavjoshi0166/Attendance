import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { WeeklySchedule, InsertWeeklySchedule } from "@shared/schema";

export function useWeeklySchedules(subjectId?: string) {
  return useQuery<WeeklySchedule[]>({
    queryKey: subjectId ? ["/api/weekly-schedules", { subjectId }] : ["/api/weekly-schedules"],
    queryFn: async () => {
      try {
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
  return useMutation({
    mutationFn: async (data: InsertWeeklySchedule) => {
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
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertWeeklySchedule> }) => {
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
  return useMutation({
    mutationFn: async (id: string) => {
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

