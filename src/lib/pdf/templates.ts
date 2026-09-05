import type { ComponentType } from "react"

import { InvoiceClassicDocument as FormeInvoiceClassic } from "@/engines/forme/components/blocks/invoice-classic/invoice-classic"
import { InvoiceConsultantDocument as FormeInvoiceConsultant } from "@/engines/forme/components/blocks/invoice-consultant/invoice-consultant"
import { InvoiceCorporateDocument as FormeInvoiceCorporate } from "@/engines/forme/components/blocks/invoice-corporate/invoice-corporate"
import { InvoiceCreativeDocument as FormeInvoiceCreative } from "@/engines/forme/components/blocks/invoice-creative/invoice-creative"
import { InvoiceMinimalDocument as FormeInvoiceMinimal } from "@/engines/forme/components/blocks/invoice-minimal/invoice-minimal"
import { InvoiceModernDocument as FormeInvoiceModern } from "@/engines/forme/components/blocks/invoice-modern/invoice-modern"
import { FinancialReportDocument as FormeFinancialReport } from "@/engines/forme/components/blocks/report-financial/report-financial"
import { MarketingReportDocument as FormeMarketingReport } from "@/engines/forme/components/blocks/report-marketing/report-marketing"
import { OperationsReportDocument as FormeOperationsReport } from "@/engines/forme/components/blocks/report-operations/report-operations"
import { SecurityReportDocument as FormeSecurityReport } from "@/engines/forme/components/blocks/report-security/report-security"
import { ReceiptKarmartDocument as FormeReceiptKarmart } from "@/engines/forme/components/blocks/receipt-karmart/receipt-karmart"
import { InvoiceClassicDocument as TakumiInvoiceClassic } from "@/engines/takumi/components/blocks/invoice-classic/invoice-classic"
import { InvoiceConsultantDocument as TakumiInvoiceConsultant } from "@/engines/takumi/components/blocks/invoice-consultant/invoice-consultant"
import { InvoiceCorporateDocument as TakumiInvoiceCorporate } from "@/engines/takumi/components/blocks/invoice-corporate/invoice-corporate"
import { InvoiceCreativeDocument as TakumiInvoiceCreative } from "@/engines/takumi/components/blocks/invoice-creative/invoice-creative"
import { InvoiceMinimalDocument as TakumiInvoiceMinimal } from "@/engines/takumi/components/blocks/invoice-minimal/invoice-minimal"
import { InvoiceModernDocument as TakumiInvoiceModern } from "@/engines/takumi/components/blocks/invoice-modern/invoice-modern"
import { FinancialReportDocument as TakumiFinancialReport } from "@/engines/takumi/components/blocks/report-financial/report-financial"
import { MarketingReportDocument as TakumiMarketingReport } from "@/engines/takumi/components/blocks/report-marketing/report-marketing"
import { OperationsReportDocument as TakumiOperationsReport } from "@/engines/takumi/components/blocks/report-operations/report-operations"
import { SecurityReportDocument as TakumiSecurityReport } from "@/engines/takumi/components/blocks/report-security/report-security"
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
  "invoice-consultant": {
    takumi: TakumiInvoiceConsultant as TemplateDocument,
    forme: FormeInvoiceConsultant as TemplateDocument,
  },
  "invoice-corporate": {
    takumi: TakumiInvoiceCorporate as TemplateDocument,
    forme: FormeInvoiceCorporate as TemplateDocument,
  },
  "invoice-creative": {
    takumi: TakumiInvoiceCreative as TemplateDocument,
    forme: FormeInvoiceCreative as TemplateDocument,
  },
  "invoice-minimal": {
    takumi: TakumiInvoiceMinimal as TemplateDocument,
    forme: FormeInvoiceMinimal as TemplateDocument,
  },
  "invoice-modern": {
    takumi: TakumiInvoiceModern as TemplateDocument,
    forme: FormeInvoiceModern as TemplateDocument,
  },
  "report-financial": {
    takumi: TakumiFinancialReport as TemplateDocument,
    forme: FormeFinancialReport as TemplateDocument,
  },
  "report-marketing": {
    takumi: TakumiMarketingReport as TemplateDocument,
    forme: FormeMarketingReport as TemplateDocument,
  },
  "report-operations": {
    takumi: TakumiOperationsReport as TemplateDocument,
    forme: FormeOperationsReport as TemplateDocument,
  },
  "report-security": {
    takumi: TakumiSecurityReport as TemplateDocument,
    forme: FormeSecurityReport as TemplateDocument,
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
