import { apiClient } from './client'
import type { Invoice, Receipt, InvoiceItemCategory, PaymentMethod } from '@/types/invoice'

export const invoicesApi = {
  create: async (visitId: string): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>('/invoices', { visitId })
    return data
  },

  getById: async (id: string): Promise<Invoice> => {
    const { data } = await apiClient.get<Invoice>(`/invoices/${id}`)
    return data
  },

  addItem: async (invoiceId: string, input: {
    description: string
    category: InvoiceItemCategory
    quantity: number
    unitPrice: number
  }): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>(`/invoices/${invoiceId}/items`, input)
    return data
  },

  recordPayment: async (invoiceId: string, input: {
    amount: number
    method: PaymentMethod
    reference?: string
  }): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>(`/invoices/${invoiceId}/payments`, input)
    return data
  },

  issue: async (invoiceId: string): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>(`/invoices/${invoiceId}/issue`)
    return data
  },

  void: async (invoiceId: string): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>(`/invoices/${invoiceId}/void`)
    return data
  },

  getReceipt: async (invoiceId: string): Promise<Receipt> => {
    const { data } = await apiClient.get<Receipt>(`/invoices/${invoiceId}/receipt`)
    return data
  },
}

