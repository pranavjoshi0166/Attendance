import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Subject, InsertSubject } from "@shared/schema";
import { getSubjects, getSubject as getLocalSubject, createSubject, updateSubject, deleteSubject } from "@/storage/subjects";

export function useSubjects() {
  return useQuery<Subject[]>({
    queryKey: ["local/subjects"],
    queryFn: async () => {
      const list = getSubjects()
      if (Array.isArray(list) && list.length > 0) return list as any as Subject[]
      try {
        const res = await fetch('/api/subjects')
        if (!res.ok) return []
        const remote = await res.json()
        if (Array.isArray(remote)) {
          try {
            const snap = JSON.stringify(remote)
            localStorage.setItem('attendance.subjects', snap)
            localStorage.setItem('attendance.subjects.backup', snap)
          } catch {}
          return remote as any as Subject[]
        }
        return []
      } catch {
        return []
      }
    },
    initialData: [],
  });
}

export function useSubject(id: string) {
  return useQuery<Subject>({
    queryKey: ["local/subjects", id],
    queryFn: async () => {
      const s = getLocalSubject(id)
      if (!s) throw new Error('Subject not found')
      return s as any as Subject
    },
    enabled: !!id,
  });
}

export function useCreateSubject() {
  return useMutation({
    mutationFn: async (data: InsertSubject) => {
      return createSubject({ name: data.name, code: data.code, teacher: data.teacher ?? null, color: data.color || '#0ea5a0' }) as any as Subject
    },
    retry: 0,
    onMutate: async (data: InsertSubject) => {
      await queryClient.cancelQueries({ queryKey: ["local/subjects"] })
      const prev = queryClient.getQueryData(["local/subjects"])
      const tempId = `temp-${Date.now()}`
      queryClient.setQueryData(["local/subjects"], (old: any) => Array.isArray(old) ? [{ id: tempId, name: data.name, code: data.code, teacher: data.teacher || null, color: data.color || '#0ea5a0' }, ...old] : old)
      return { prev, tempId }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["local/subjects"], ctx.prev as any)
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["local/subjects"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useUpdateSubject() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSubject> }) => {
      return updateSubject(id, { name: data.name, code: data.code, teacher: data.teacher ?? null, color: data.color }) as any as Subject
    },
    onMutate: async ({ id, data }: { id: string; data: Partial<InsertSubject> }) => {
      await queryClient.cancelQueries({ queryKey: ["local/subjects"] })
      const prev = queryClient.getQueryData(["local/subjects"])
      queryClient.setQueryData(["local/subjects"], (old: any) => Array.isArray(old) ? old.map((s: any) => s?.id === id ? { ...s, ...data } : s) : old)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["local/subjects"], ctx.prev as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}

export function useDeleteSubject() {
  return useMutation({
    mutationFn: async (id: string) => {
      const ok = deleteSubject(id)
      if (!ok) throw new Error('Subject not found')
      return { ok }
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["local/subjects"] })
      const prev = queryClient.getQueryData(["local/subjects"])
      queryClient.setQueryData(["local/subjects"], (old: any) => Array.isArray(old) ? old.filter((s) => s?.id !== id) : old)
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["local/subjects"], ctx.prev as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local/subjects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
  });
}
