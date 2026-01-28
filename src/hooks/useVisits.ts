import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { visitsApi } from '@/api/visits'
import type { CreateVisitDto } from '@/types/visit'

export function useVisitCreate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateVisitDto) => visitsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visits'] })
      qc.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

export function useVisit(id: string | undefined) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () => visitsApi.getById(id!),
    enabled: !!id,
  })
}
