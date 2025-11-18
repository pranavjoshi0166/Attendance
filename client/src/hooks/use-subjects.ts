import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Subject, InsertSubject } from "@shared/schema";

export function useSubjects() {
  return useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      try {
        console.log('[useSubjects] Fetching subjects from API...')
        const res = await fetch('/api/subjects')
        if (!res.ok) {
          console.error('[useSubjects] Failed to fetch subjects:', res.status)
          return []
        }
        const data = await res.json()
        console.log('[useSubjects] Received subjects data:', data)
        if (!Array.isArray(data)) {
          console.error('[useSubjects] Invalid subjects data format:', data)
          return []
        }
        console.log('[useSubjects] Returning', data.length, 'subjects')
        return data
      } catch (error) {
        console.error('[useSubjects] Error fetching subjects:', error)
        return []
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useSubject(id: string) {
  return useQuery<Subject>({
    queryKey: ["/api/subjects", id],
    queryFn: async () => {
      const res = await fetch(`/api/subjects/${id}`)
      if (!res.ok) throw new Error('Subject not found')
      return res.json()
    },
    enabled: !!id,
  });
}

export function useCreateSubject() {
  return useMutation({
    mutationFn: async (data: InsertSubject) => {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.details || 'Failed to create subject')
      }
      return res.json()
    },
    retry: 0,
    onMutate: async (data: InsertSubject) => {
      await queryClient.cancelQueries({ queryKey: ["/api/subjects"] })
      const prev = queryClient.getQueryData(["/api/subjects"])
      const tempId = `temp-${Date.now()}`
      queryClient.setQueryData(["/api/subjects"], (old: any) => 
        Array.isArray(old) ? [{ id: tempId, ...data, color: data.color || '#0ea5a0' }, ...old] : old
      )
      return { prev, tempId }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["/api/subjects"], ctx.prev as any)
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
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.details || 'Failed to update subject')
      }
      return res.json()
    },
    onMutate: async ({ id, data }: { id: string; data: Partial<InsertSubject> }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/subjects"] })
      const prev = queryClient.getQueryData(["/api/subjects"])
      queryClient.setQueryData(["/api/subjects"], (old: any) => 
        Array.isArray(old) ? old.map((s: any) => s?.id === id ? { ...s, ...data } : s) : old
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["/api/subjects"], ctx.prev as any)
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
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete subject')
      }
      return { ok: true }
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/subjects"] })
      const prev = queryClient.getQueryData(["/api/subjects"])
      queryClient.setQueryData(["/api/subjects"], (old: any) => 
        Array.isArray(old) ? old.filter((s) => s?.id !== id) : old
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["/api/subjects"], ctx.prev as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}
