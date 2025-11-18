import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Lecture, InsertLecture } from "@shared/schema";

export function useLectures(subjectId?: string) {
  return useQuery<Lecture[]>({
    queryKey: subjectId ? ["/api/lectures", { subjectId }] : ["/api/lectures"],
    queryFn: async () => {
      try {
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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
  return useMutation({
    mutationFn: async (data: InsertLecture) => {
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
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertLecture> }) => {
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
  return useMutation({
    mutationFn: async (id: string) => {
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
