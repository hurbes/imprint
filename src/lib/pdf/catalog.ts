import { invoiceMinimalFixture } from "./invoice-minimal-fixture"
import { karmartReceiptFixture } from "./karmart-receipt-fixture"
import type { TemplateName } from "./types"
import { TEMPLATE_NAMES } from "./types"

export const templateCatalog: Record<
  TemplateName,
  { label: string; sampleData: Record<string, unknown> }
> = {
  "invoice-classic": {
    label: "Invoice Classic",
    sampleData: { ...invoiceMinimalFixture },
  },
  "receipt-karmart": {
    label: "Receipt Karmart",
    sampleData: { ...karmartReceiptFixture },
  },
}

export const templateOptions = TEMPLATE_NAMES.map((name) => ({
  name,
  label: templateCatalog[name].label,
}))
