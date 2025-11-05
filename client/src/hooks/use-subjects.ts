import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subject, InsertSubject } from "@shared/schema";

export function useSubjects() {
  return useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
}

export function useSubject(id: string) {
  return useQuery<Subject>({
    queryKey: ["/api/subjects", id],
    enabled: !!id,
  });
}

export function useCreateSubject() {
  return useMutation({
    mutationFn: async (data: InsertSubject) => {
      return apiRequest<Subject>("/api/subjects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useUpdateSubject() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSubject> }) => {
      return apiRequest<Subject>(`/api/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useDeleteSubject() {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/subjects/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}
