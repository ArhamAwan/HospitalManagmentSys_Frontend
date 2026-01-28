import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi } from '@/api/patients'
import type { CreatePatientDto } from '@/types/patient'

export function usePatientsSearch(query: string) {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => patientsApi.search(query),
  })
}

export function usePatientCreate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePatientDto) => patientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsApi.getById(id!),
    enabled: !!id,
  })
}

export function usePatientHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', id, 'history'],
    queryFn: () => patientsApi.getHistory(id!),
    enabled: !!id,
  })
}
