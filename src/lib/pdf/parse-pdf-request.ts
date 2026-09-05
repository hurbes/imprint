import {
  isEngine,
  isPdfFailure,
  isTemplateName,
  type DocumentDraft,
  type PdfDesign,
  type PdfFailure,
  type PdfRequest,
  type TemplateDesign,
} from "./types"

const invalid = (message: string): PdfFailure => ({
  kind: "invalid-request",
  message,
})

const unknownTemplate = (name: string): PdfFailure => ({
  kind: "unknown-template",
  message: `Unknown template: ${name}`,
  name,
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseTemplateDesign(value: unknown): TemplateDesign | PdfFailure {
  if (!isRecord(value) || value.kind !== "template") {
    return invalid("design must be a template, html, or tree object")
  }
  if (!isTemplateName(value.name)) {
    return unknownTemplate(String(value.name ?? ""))
  }
  return { kind: "template", name: value.name }
}

function parseDesign(value: unknown): PdfDesign | PdfFailure {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return invalid("design must be a template, html, or tree object")
  }
  if (value.kind === "template") {
    return parseTemplateDesign(value)
  }
  if (value.kind === "html") {
    if (typeof value.markup !== "string" || value.markup.trim() === "") {
      return invalid("html design requires non-empty markup")
    }
    return { kind: "html", markup: value.markup }
  }
  if (value.kind === "tree") {
    if (!("node" in value)) {
      return invalid("tree design requires a node")
    }
    return { kind: "tree", node: value.node }
  }
  return invalid("design must be a template, html, or tree object")
}

function parseFilename(value: unknown): string | PdfFailure | undefined {
  if (value === undefined) {
    return undefined
  }
  if (typeof value !== "string" || value.trim() === "") {
    return invalid("filename must be a non-empty string")
  }
  return value
}

export function parsePdfRequest(input: unknown): PdfRequest | PdfFailure {
  if (!isRecord(input)) {
    return invalid("request must be an object")
  }
  if (!isEngine(input.engine)) {
    return invalid("engine must be takumi or forme")
  }
  if (!isRecord(input.data)) {
    return invalid("data must be an object")
  }
  const filename = parseFilename(input.filename)
  if (filename !== undefined && typeof filename !== "string") {
    return filename
  }
  if (input.engine === "forme") {
    const design = parseTemplateDesign(input.design)
    if (isPdfFailure(design)) {
      if (isRecord(input.design) && input.design.kind !== "template") {
        return invalid("forme only accepts template designs")
      }
      return design
    }
    return {
      engine: "forme",
      design,
      data: input.data,
      ...(filename ? { filename } : {}),
    }
  }
  const design = parseDesign(input.design)
  if (isPdfFailure(design)) {
    return design
  }
  return {
    engine: "takumi",
    design,
    data: input.data,
    ...(filename ? { filename } : {}),
  }
}

export function parseDocumentDraft(input: unknown): DocumentDraft | PdfFailure {
  if (!isRecord(input)) {
    return invalid("request must be an object")
  }
  if (typeof input.title !== "string" || input.title.trim() === "") {
    return invalid("title must be a non-empty string")
  }
  const parsed = parsePdfRequest(input)
  if (isPdfFailure(parsed)) {
    return parsed
  }
  return {
    title: input.title.trim(),
    engine: parsed.engine,
    design: parsed.design,
    data: parsed.data,
  }
}

