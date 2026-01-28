import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/api/invoices'
import type { InvoiceItemCategory, PaymentMethod } from '@/types/invoice'

export function useInvoice(invoiceId?: string) {
  return useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId!),
    enabled: !!invoiceId,
  })
}

export function useInvoiceCreate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (visitId: string) => invoicesApi.create(visitId),
    onSuccess: (inv) => {
      qc.setQueryData(['invoices', inv.id], inv)
    },
  })
}

export function useInvoiceAddItem(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      description: string
      category: InvoiceItemCategory
      quantity: number
      unitPrice: number
    }) => invoicesApi.addItem(invoiceId, input),
    onSuccess: (inv) => {
      qc.setQueryData(['invoices', inv.id], inv)
    },
  })
}

export function useInvoiceRecordPayment(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { amount: number; method: PaymentMethod; reference?: string }) =>
      invoicesApi.recordPayment(invoiceId, input),
    onSuccess: (inv) => {
      qc.setQueryData(['invoices', inv.id], inv)
    },
  })
}

export function useInvoiceIssue(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => invoicesApi.issue(invoiceId),
    onSuccess: (inv) => {
      qc.setQueryData(['invoices', inv.id], inv)
    },
  })
}

export function useInvoiceVoid(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => invoicesApi.void(invoiceId),
    onSuccess: (inv) => {
      qc.setQueryData(['invoices', inv.id], inv)
    },
  })
}

export function useInvoiceReceipt(invoiceId: string) {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'receipt'],
    queryFn: () => invoicesApi.getReceipt(invoiceId),
    enabled: !!invoiceId,
    staleTime: 60_000,
  })
}

