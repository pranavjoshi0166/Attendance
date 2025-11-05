import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Lecture, InsertLecture } from "@shared/schema";

export function useLectures(subjectId?: string) {
  return useQuery<Lecture[]>({
    queryKey: subjectId ? ["/api/lectures", { subjectId }] : ["/api/lectures"],
    queryFn: async () => {
      const url = subjectId ? `/api/lectures?subjectId=${subjectId}` : "/api/lectures";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch lectures");
      return res.json();
    },
  });
}

export function useLecture(id: string) {
  return useQuery<Lecture>({
    queryKey: ["/api/lectures", id],
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
