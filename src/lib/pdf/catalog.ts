import { invoiceMinimalFixture } from "./invoice-minimal-fixture"
import { karmartReceiptFixture } from "./karmart-receipt-fixture"
import type { TemplateName } from "./types"
import { TEMPLATE_NAMES } from "./types"

function reportSample(title: string): Record<string, unknown> {
  return {
    title: `${title} Review`,
    subtitle: "Quarterly summary",
    generatedAt: "February 23, 2026",
    period: "Q1 2026",
    author: "Ops",
    summary: [{ label: "Score", value: "88", trend: "+4", tone: "success" }],
    rows: [
      {
        label: "Core work",
        owner: "A. Patel",
        progress: 88,
        risk: "Low",
        status: "On Track",
      },
    ],
    series: [
      { label: "Jan", value: 40 },
      { label: "Feb", value: 55 },
    ],
    highlights: ["Delivery stayed on schedule."],
  }
}

const invoiceSample = { ...invoiceMinimalFixture }

export const templateCatalog: Record<
  TemplateName,
  { label: string; sampleData: Record<string, unknown> }
> = {
  "invoice-classic": { label: "Invoice Classic", sampleData: invoiceSample },
  "invoice-consultant": {
    label: "Invoice Consultant",
    sampleData: invoiceSample,
  },
  "invoice-corporate": { label: "Invoice Corporate", sampleData: invoiceSample },
  "invoice-creative": { label: "Invoice Creative", sampleData: invoiceSample },
  "invoice-minimal": { label: "Invoice Minimal", sampleData: invoiceSample },
  "invoice-modern": { label: "Invoice Modern", sampleData: invoiceSample },
  "report-financial": {
    label: "Report Financial",
    sampleData: reportSample("Financial"),
  },
  "report-marketing": {
    label: "Report Marketing",
    sampleData: reportSample("Marketing"),
  },
  "report-operations": {
    label: "Report Operations",
    sampleData: reportSample("Operations"),
  },
  "report-security": {
    label: "Report Security",
    sampleData: reportSample("Security"),
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
