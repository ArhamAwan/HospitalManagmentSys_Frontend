import { useQuery } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.getAll(),
  })
}
