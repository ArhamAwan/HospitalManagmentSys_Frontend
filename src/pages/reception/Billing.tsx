import { useMemo, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SurfaceCard } from '@/components/ui/surface-card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { usePatientsSearch, usePatientHistory } from '@/hooks/usePatients'
import { useInvoiceCreate, useInvoice, useInvoiceAddItem, useInvoiceRecordPayment, useInvoiceIssue, useInvoiceVoid, useInvoiceReceipt } from '@/hooks/useInvoices'
import type { Patient } from '@/types/patient'
import type { InvoiceItemCategory, PaymentMethod } from '@/types/invoice'
import { cn } from '@/lib/utils'
import { CreditCard, Search, ReceiptText, Plus, Printer, Ban } from 'lucide-react'

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  )
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'PAID':
      return 'secondary'
    case 'PARTIALLY_PAID':
      return 'default'
    case 'VOID':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function ReceptionBilling() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)
  const search = usePatientsSearch(debounced)

  const [selected, setSelected] = useState<Patient | null>(null)
  const [open, setOpen] = useState(false)

  const history = usePatientHistory(selected?.id)

  const createInvoice = useInvoiceCreate()
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const invoiceQuery = useInvoice(invoiceId ?? undefined)

  const invoice = invoiceQuery.data
  const addItem = useInvoiceAddItem(invoiceId ?? '')
  const recordPayment = useInvoiceRecordPayment(invoiceId ?? '')
  const issue = useInvoiceIssue(invoiceId ?? '')
  const voidInv = useInvoiceVoid(invoiceId ?? '')
  const receiptQuery = useInvoiceReceipt(invoiceId ?? '')

  const [itemDesc, setItemDesc] = useState('')
  const [itemCategory, setItemCategory] = useState<InvoiceItemCategory>('LAB')
  const [itemQty, setItemQty] = useState(1)
  const [itemUnit, setItemUnit] = useState<number>(0)

  const [payAmount, setPayAmount] = useState<number>(0)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')
  const [payRef, setPayRef] = useState('')

  const visits = useMemo(() => {
    const v = history.data ?? []
    return [...v].sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1))
  }, [history.data])

  const openBilling = (p: Patient) => {
    setSelected(p)
    setInvoiceId(null)
    setOpen(true)
  }

  const closeBilling = () => {
    setOpen(false)
    setSelected(null)
    setInvoiceId(null)
  }

  const startInvoice = async (visitId: string) => {
    const inv = await createInvoice.mutateAsync(visitId)
    setInvoiceId(inv.id)
    // Prefill payment amount with balance due
    setPayAmount(inv.balanceDue)
  }

  const onAddItem = async () => {
    if (!invoiceId) return
    const desc = itemDesc.trim()
    if (!desc) return
    await addItem.mutateAsync({
      description: desc,
      category: itemCategory,
      quantity: itemQty,
      unitPrice: itemUnit,
    })
    setItemDesc('')
    setItemQty(1)
    setItemUnit(0)
  }

  const onRecordPayment = async () => {
    if (!invoiceId) return
    if (!payAmount || payAmount <= 0) return
    await recordPayment.mutateAsync({
      amount: payAmount,
      method: payMethod,
      reference: payRef.trim() || undefined,
    })
    setPayRef('')
  }

  const onPrintReceipt = () => {
    if (!invoice) return
    const w = window.open('', 'receipt', 'width=720,height=900')
    if (!w) return
    const title = invoice.receipt?.receiptNumber ?? 'Receipt'
    const items = invoice.items
      .map(
        (it) =>
          `<tr><td>${it.description}</td><td style="text-align:right;">${it.quantity}</td><td style="text-align:right;">${money(
            it.unitPrice
          )}</td><td style="text-align:right;">${money(it.lineTotal)}</td></tr>`
      )
      .join('')
    w.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
            h1,h2,h3 { margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 6px; font-size: 14px; }
            th { text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; }
            .row { display:flex; justify-content: space-between; gap: 12px; margin-top: 8px; }
            .muted { color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>Atta Khan Memorial Hospital</h2>
          <div class="muted">Billing receipt</div>
          <div class="row"><div><strong>Invoice</strong></div><div>${invoice.id}</div></div>
          <div class="row"><div><strong>Status</strong></div><div>${invoice.status}</div></div>
          <div class="row"><div><strong>Total</strong></div><div>${money(invoice.total)}</div></div>
          <div class="row"><div><strong>Paid</strong></div><div>${money(invoice.paidTotal)}</div></div>
          <div class="row"><div><strong>Balance</strong></div><div>${money(invoice.balanceDue)}</div></div>
          <table>
            <thead><tr><th>Description</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Unit</th><th style="text-align:right;">Total</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    w.document.close()
  }

  return (
    <Layout>
      <PageContainer
        title="Billing"
        breadcrumbs={[{ label: 'Reception', to: '/reception' }, { label: 'Billing' }]}
      >
        <div className="space-y-6">
          <SurfaceCard>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5" />
                Billing desk
              </CardTitle>
              <CardDescription>Search a patient and open billing for a visit.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  placeholder="Search by name, phone, or patient ID…"
                  aria-label="Search patients for billing"
                />
              </div>
            </CardContent>
          </SurfaceCard>

          {search.isSuccess && !search.isLoading && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-[160px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {search.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.patientId}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => openBilling(p)} className="gap-2">
                          <ReceiptText className="h-4 w-4" />
                          Open billing
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={open} onOpenChange={(o) => !o && closeBilling()}>
            <DialogContent className="max-w-5xl" showClose={true}>
              <DialogHeader>
                <DialogTitle>Billing</DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
                <div className="space-y-4">
                  <SurfaceCard>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Select visit</CardTitle>
                      <CardDescription>
                        {selected ? `${selected.name} (${selected.patientId})` : '—'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-[420px] overflow-auto rounded-xl border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Token</TableHead>
                              <TableHead>Doctor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {visits.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                  No visits found
                                </TableCell>
                              </TableRow>
                            ) : (
                              visits.map((v) => (
                                <TableRow
                                  key={v.id}
                                  className="cursor-pointer hover:bg-accent/40"
                                  onClick={() => startInvoice(v.id)}
                                >
                                  <TableCell className="font-mono">{v.tokenNumber}</TableCell>
                                  <TableCell className="truncate">
                                    {v.doctor?.name ?? v.doctorId}
                                    {v.isEmergency && (
                                      <Badge variant="emergency" className="ml-2">
                                        Emergency
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </SurfaceCard>
                </div>

                <div className="space-y-4">
                  <SurfaceCard>
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">Invoice</CardTitle>
                          <CardDescription>
                            {invoice ? (
                              <span className="min-w-0 break-all font-mono text-xs text-muted-foreground">
                                {invoice.id}
                              </span>
                            ) : (
                              'Open a visit to load invoice'
                            )}
                          </CardDescription>
                        </div>
                        {invoice && (
                          <div className="flex items-center gap-2">
                            <Badge variant={statusBadgeVariant(invoice.status) as any} className="rounded-full">
                              {invoice.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={issue.isPending || invoice.status === 'VOID'}
                              onClick={() => issue.mutate()}
                            >
                              Issue
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                              disabled={voidInv.isPending || invoice.status === 'VOID'}
                              onClick={() => voidInv.mutate()}
                            >
                              <Ban className="h-4 w-4" />
                              Void
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {invoiceQuery.isLoading ? (
                        <div className="text-sm text-muted-foreground">Loading invoice…</div>
                      ) : !invoice ? (
                        <div className="text-sm text-muted-foreground">
                          Select a visit on the left to create/open an invoice.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border bg-card p-3">
                              <div className="text-xs text-muted-foreground">Total</div>
                              <div className="text-lg font-semibold tabular-nums">{money(invoice.total)}</div>
                            </div>
                            <div className="rounded-xl border bg-card p-3">
                              <div className="text-xs text-muted-foreground">Paid</div>
                              <div className="text-lg font-semibold tabular-nums">{money(invoice.paidTotal)}</div>
                            </div>
                            <div className="rounded-xl border bg-card p-3">
                              <div className="text-xs text-muted-foreground">Balance due</div>
                              <div className={cn('text-lg font-semibold tabular-nums', invoice.balanceDue > 0 && 'text-primary')}>
                                {money(invoice.balanceDue)}
                              </div>
                            </div>
                            <div className="rounded-xl border bg-card p-3">
                              <div className="text-xs text-muted-foreground">Items</div>
                              <div className="text-lg font-semibold tabular-nums">
                                {invoice.items ? invoice.items.length : 0}
                              </div>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-xl border bg-card">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Description</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead className="text-right">Qty</TableHead>
                                  <TableHead className="text-right">Unit</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(invoice.items ?? []).map((it) => (
                                  <TableRow key={it.id}>
                                    <TableCell className="font-medium">{it.description}</TableCell>
                                    <TableCell>{it.category}</TableCell>
                                    <TableCell className="text-right tabular-nums">{it.quantity}</TableCell>
                                    <TableCell className="text-right tabular-nums">{money(it.unitPrice)}</TableCell>
                                    <TableCell className="text-right tabular-nums">{money(it.lineTotal)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold">Add item</div>
                              </div>
                              <div className="grid gap-2 rounded-xl border bg-card p-3">
                                <Input
                                  value={itemDesc}
                                  onChange={(e) => setItemDesc(e.target.value)}
                                  placeholder="e.g., Lab CBC, X-Ray, Medicine"
                                />
                                <div className="grid gap-2 sm:grid-cols-3">
                                  <Select value={itemCategory} onValueChange={(v) => setItemCategory(v as InvoiceItemCategory)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(['LAB','IMAGING','MEDICINE','PROCEDURE','OTHER','CONSULTATION','EMERGENCY'] as const).map((c) => (
                                        <SelectItem key={c} value={c}>
                                          {c}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={itemQty}
                                    onChange={(e) => setItemQty(Number(e.target.value))}
                                    placeholder="Qty"
                                  />
                                  <Input
                                    type="number"
                                    min={0}
                                    value={itemUnit}
                                    onChange={(e) => setItemUnit(Number(e.target.value))}
                                    placeholder="Unit price"
                                  />
                                </div>
                                <Button
                                  onClick={onAddItem}
                                  disabled={addItem.isPending || invoice.status === 'VOID'}
                                  className="justify-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add item
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="text-sm font-semibold">Take payment</div>
                              <div className="grid gap-2 rounded-xl border bg-card p-3">
                                <div className="grid gap-2 sm:grid-cols-[1fr,1fr,1.4fr]">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(Number(e.target.value))}
                                    placeholder="Amount"
                                  />
                                  <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(['CASH','CARD','BANK_TRANSFER','MOBILE_WALLET','OTHER'] as const).map((m) => (
                                        <SelectItem key={m} value={m}>
                                          {m}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    className="min-w-0"
                                    value={payRef}
                                    onChange={(e) => setPayRef(e.target.value)}
                                    placeholder="Reference (optional)"
                                  />
                                </div>
                                <Button
                                  onClick={onRecordPayment}
                                  disabled={recordPayment.isPending || invoice.status === 'VOID'}
                                  className="justify-center"
                                >
                                  Record payment
                                </Button>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-muted-foreground">
                              {invoice.receipt?.receiptNumber ? (
                                <>
                                  Receipt: <span className="font-mono">{invoice.receipt.receiptNumber}</span>
                                </>
                              ) : (
                                'Receipt not generated yet'
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                disabled={receiptQuery.isFetching || invoice.status === 'VOID'}
                                onClick={() => receiptQuery.refetch()}
                              >
                                <ReceiptText className="h-4 w-4" />
                                {invoice.receipt?.receiptNumber ? 'Refresh receipt' : 'Generate receipt'}
                              </Button>
                              <Button
                                size="sm"
                                className="gap-2"
                                disabled={!invoice.receipt?.receiptNumber}
                                onClick={onPrintReceipt}
                              >
                                <Printer className="h-4 w-4" />
                                Print
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </SurfaceCard>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
    </Layout>
  )
}

