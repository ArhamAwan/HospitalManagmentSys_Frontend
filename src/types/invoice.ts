import type { Visit } from './visit'

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID'

export type InvoiceItemCategory =
  | 'CONSULTATION'
  | 'EMERGENCY'
  | 'LAB'
  | 'IMAGING'
  | 'MEDICINE'
  | 'PROCEDURE'
  | 'OTHER'

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_WALLET' | 'OTHER'

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  category: InvoiceItemCategory
  quantity: number
  unitPrice: number
  lineTotal: number
  createdAt: string
}

export interface PaymentTransaction {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference?: string | null
  createdAt: string
}

export interface Receipt {
  id: string
  invoiceId: string
  receiptNumber: string
  snapshot: unknown
  createdAt: string
}

export interface Invoice {
  id: string
  visitId: string
  status: InvoiceStatus

  subtotal: number
  discount: number
  tax: number
  total: number
  paidTotal: number
  balanceDue: number

  issuedAt?: string | null
  voidedAt?: string | null
  createdAt: string
  updatedAt: string

  items: InvoiceItem[]
  payments: PaymentTransaction[]
  receipt?: Receipt | null
  visit?: Visit
}

