import type { ComponentType } from "react"

import { InvoiceClassicDocument as FormeInvoiceClassic } from "@/engines/forme/components/blocks/invoice-classic/invoice-classic"
import { ReceiptKarmartDocument as FormeReceiptKarmart } from "@/engines/forme/components/blocks/receipt-karmart/receipt-karmart"
import { InvoiceClassicDocument as TakumiInvoiceClassic } from "@/engines/takumi/components/blocks/invoice-classic/invoice-classic"
import { ReceiptKarmartDocument as TakumiReceiptKarmart } from "@/engines/takumi/components/blocks/receipt-karmart/receipt-karmart"

import type { Engine, TemplateName } from "./types"

type TemplateDocument = ComponentType<{ data?: Record<string, unknown> }>

export type TemplateEntry = {
  takumi: TemplateDocument
  forme: TemplateDocument
}

export const templates: Record<TemplateName, TemplateEntry> = {
  "invoice-classic": {
    takumi: TakumiInvoiceClassic as TemplateDocument,
    forme: FormeInvoiceClassic as TemplateDocument,
  },
  "receipt-karmart": {
    takumi: TakumiReceiptKarmart as TemplateDocument,
    forme: FormeReceiptKarmart as TemplateDocument,
  },
}

export function getTemplate(name: string): TemplateEntry | undefined {
  if (!(name in templates)) {
    return undefined
  }
  return templates[name as TemplateName]
}

export function templateDocument(
  engine: Engine,
  name: TemplateName,
): TemplateDocument | undefined {
  const entry = getTemplate(name)
  if (!entry) {
    return undefined
  }
  return entry[engine]
}
