export const ENGINES = ["takumi", "forme"] as const
export type Engine = (typeof ENGINES)[number]

export const TEMPLATE_NAMES = [
  "invoice-classic",
  "receipt-karmart",
] as const
export type TemplateName = (typeof TEMPLATE_NAMES)[number]

export type TemplateDesign = {
  kind: "template"
  name: TemplateName
}

export type HtmlDesign = {
  kind: "html"
  markup: string
}

export type TreeDesign = {
  kind: "tree"
  node: unknown
}

export type PdfDesign = TemplateDesign | HtmlDesign | TreeDesign

export type TakumiPdfRequest = {
  engine: "takumi"
  design: PdfDesign
  data: Record<string, unknown>
  filename?: string
}

export type FormePdfRequest = {
  engine: "forme"
  design: TemplateDesign
  data: Record<string, unknown>
  filename?: string
}

export type PdfRequest = TakumiPdfRequest | FormePdfRequest

export type PdfFailure = {
  kind: "invalid-request" | "unknown-template" | "invalid-data" | "render-failed"
  message: string
  name?: string
}

export type PdfResult = {
  bytes: Uint8Array
  filename: string
}

export type PdfOutcome =
  | { ok: true; value: PdfResult }
  | { ok: false; error: PdfFailure }

export type PdfDocument = {
  id: string
  title: string
  engine: Engine
  design: PdfDesign
  data: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export type DocumentSummary = {
  id: string
  title: string
  engine: Engine
  updatedAt: number
}

export type DocumentDraft = {
  title: string
  engine: Engine
  design: PdfDesign
  data: Record<string, unknown>
}

export function isPdfFailure(value: unknown): value is PdfFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "message" in value &&
    !("engine" in value)
  )
}

export function isEngine(value: unknown): value is Engine {
  return value === "takumi" || value === "forme"
}

export function isTemplateName(value: unknown): value is TemplateName {
  return (
    typeof value === "string" &&
    (TEMPLATE_NAMES as readonly string[]).includes(value)
  )
}
