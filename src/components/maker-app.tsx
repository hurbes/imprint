import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FileTextIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { templateCatalog, templateOptions } from "@/lib/pdf/catalog"
import { parsePdfRequest } from "@/lib/pdf/parse-pdf-request"
import {
  isPdfFailure,
  type DocumentSummary,
  type Engine,
  type PdfDocument,
  type PdfRequest,
  type TemplateName,
} from "@/lib/pdf/types"

const previewDelayMs = 400

export function MakerApp() {
  const queryClient = useQueryClient()
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [title, setTitle] = useState("Untitled")
  const [engine, setEngine] = useState<Engine>("takumi")
  const [templateName, setTemplateName] = useState<TemplateName>("invoice-minimal")
  const [designKind, setDesignKind] = useState<"template" | "html">("template")
  const [markup, setMarkup] = useState("<div>Hello</div>")
  const [dataText, setDataText] = useState(
    JSON.stringify(templateCatalog["invoice-minimal"].sampleData, null, 2),
  )
  const [debouncedPayload, setDebouncedPayload] = useState<unknown>(null)

  const requestJson = useMemo(() => {
    const data = parseJsonObject(dataText)
    if (engine === "forme" || designKind === "template") {
      return {
        engine,
        design: { kind: "template", name: templateName },
        data: data ?? {},
        filename: `${slug(title)}.pdf`,
      }
    }
    return {
      engine: "takumi",
      design: { kind: "html", markup },
      data: data ?? {},
      filename: `${slug(title)}.pdf`,
    }
  }, [dataText, designKind, engine, markup, templateName, title])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedPayload(requestJson)
    }, previewDelayMs)
    return () => window.clearTimeout(timer)
  }, [requestJson])

  const parsed = parsePdfRequest(debouncedPayload)
  const previewQuery = useQuery({
    queryKey: ["pdf-preview", debouncedPayload],
    enabled: Boolean(debouncedPayload) && !isPdfFailure(parsed),
    queryFn: () => renderPdf(debouncedPayload),
  })

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: listDocuments,
  })

  const saveMutation = useMutation({
    mutationFn: saveDocument,
    onSuccess: (document) => {
      setDocumentId(document.id)
      toast.success("Saved")
      void queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Save failed")
    },
  })

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (previewQuery.data && previewMatches(previewQuery.data.request, requestJson)) {
        return previewQuery.data
      }
      return renderPdf(requestJson)
    },
    onSuccess: (result) => {
      downloadBlob(result.blob, result.filename)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Download failed")
    },
  })

  const previewUrl = previewQuery.data?.url
  const previewPending = previewQuery.isFetching || !debouncedPayload
  const savePending = saveMutation.isPending
  const downloadPending = downloadMutation.isPending

  function applyDocument(document: PdfDocument) {
    setDocumentId(document.id)
    setTitle(document.title)
    setEngine(document.engine)
    if (document.design.kind === "template") {
      setDesignKind("template")
      setTemplateName(document.design.name)
    } else if (document.design.kind === "html") {
      setDesignKind("html")
      setMarkup(document.design.markup)
    }
    setDataText(JSON.stringify(document.data, null, 2))
  }

  return (
    <div className="flex min-h-svh gap-4 p-4">
      <Card className="flex w-64 shrink-0 flex-col">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Saved locally in SQLite.</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setDocumentId(null)
              setTitle("Untitled")
              setEngine("takumi")
              setTemplateName("invoice-minimal")
              setDesignKind("template")
              setDataText(
                JSON.stringify(
                  templateCatalog["invoice-minimal"].sampleData,
                  null,
                  2,
                ),
              )
            }}
          >
            New
          </Button>
          <Separator />
          <ScrollArea className="min-h-0 flex-1">
            {documentsQuery.data && documentsQuery.data.length > 0 ? (
              <div className="flex flex-col gap-1">
                {documentsQuery.data.map((document) => (
                  <Button
                    key={document.id}
                    variant={document.id === documentId ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      void loadDocument(document.id)
                        .then(applyDocument)
                        .catch((error) => {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Failed to load document",
                          )
                        })
                    }}
                  >
                    <span className="truncate">{document.title}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>No documents</EmptyTitle>
                  <EmptyDescription>
                    Save a design to see it here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex w-[28rem] shrink-0 flex-col">
        <CardHeader>
          <CardTitle>Design and data</CardTitle>
          <CardDescription>
            Same payload an agent posts to /api/pdf.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Engine</FieldLabel>
              <ToggleGroup
                value={[engine]}
                onValueChange={(next) => {
                  const value = next[0]
                  if (value === "takumi" || value === "forme") {
                    setEngine(value)
                    if (value === "forme") {
                      setDesignKind("template")
                    }
                  }
                }}
              >
                <ToggleGroupItem value="takumi">Takumi</ToggleGroupItem>
                <ToggleGroupItem value="forme">Forme</ToggleGroupItem>
              </ToggleGroup>
            </Field>
            {engine === "takumi" ? (
              <Field>
                <FieldLabel>Source</FieldLabel>
                <ToggleGroup
                  value={[designKind]}
                  onValueChange={(next) => {
                    const value = next[0]
                    if (value === "template" || value === "html") {
                      setDesignKind(value)
                    }
                  }}
                >
                  <ToggleGroupItem value="template">Template</ToggleGroupItem>
                  <ToggleGroupItem value="html">HTML</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            ) : null}
            {designKind === "template" || engine === "forme" ? (
              <Field>
                <FieldLabel>Template</FieldLabel>
                <Select
                  value={templateName}
                  onValueChange={(value) => {
                    if (typeof value !== "string") {
                      return
                    }
                    const name = value as TemplateName
                    setTemplateName(name)
                    setDataText(
                      JSON.stringify(templateCatalog[name].sampleData, null, 2),
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {templateOptions.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="markup">HTML</FieldLabel>
                <Textarea
                  id="markup"
                  value={markup}
                  onChange={(event) => setMarkup(event.target.value)}
                  className="min-h-32 font-mono text-xs"
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="data">Data</FieldLabel>
              <Textarea
                id="data"
                value={dataText}
                onChange={(event) => setDataText(event.target.value)}
                className="min-h-48 font-mono text-xs"
              />
            </Field>
          </FieldGroup>
          <div className="flex gap-2">
            <Button
              disabled={savePending}
              onClick={() => {
                const current = parsePdfRequest(requestJson)
                if (isPdfFailure(current)) {
                  toast.error(current.message)
                  return
                }
                saveMutation.mutate({
                  id: documentId,
                  title,
                  request: current,
                })
              }}
            >
              {savePending ? <Spinner data-icon="inline-start" /> : null}
              Save
            </Button>
            <Button
              variant="outline"
              disabled={downloadPending || isPdfFailure(parsePdfRequest(requestJson))}
              onClick={() => downloadMutation.mutate()}
            >
              {downloadPending ? <Spinner data-icon="inline-start" /> : null}
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-w-0 flex-1 flex-col">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Regenerated from the current design.</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          {previewQuery.isError ? (
            <p className="text-sm text-destructive">
              {previewQuery.error instanceof Error
                ? previewQuery.error.message
                : "Preview failed"}
            </p>
          ) : previewPending && !previewUrl ? (
            <Skeleton className="min-h-96 flex-1" />
          ) : previewUrl ? (
            <iframe
              title="PDF preview"
              src={previewUrl}
              className="min-h-96 w-full flex-1 rounded-md border"
            />
          ) : (
            <Skeleton className="min-h-96 flex-1" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text)
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function slug(title: string): string {
  const next = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return next.length > 0 ? next : "document"
}

function previewMatches(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

async function renderPdf(body: unknown): Promise<{
  blob: Blob
  filename: string
  url: string
  request: unknown
}> {
  const response = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = (await response.json()) as { message?: string }
    throw new Error(error.message ?? "Render failed")
  }
  const blob = await response.blob()
  const filename =
    filenameFromHeader(response.headers.get("Content-Disposition")) ??
    "document.pdf"
  return {
    blob,
    filename,
    url: URL.createObjectURL(blob),
    request: body,
  }
}

function filenameFromHeader(header: string | null): string | null {
  if (!header) {
    return null
  }
  const match = /filename="([^"]+)"/.exec(header)
  return match?.[1] ?? null
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function listDocuments(): Promise<DocumentSummary[]> {
  const response = await fetch("/api/documents")
  if (!response.ok) {
    throw new Error("Failed to list documents")
  }
  return (await response.json()) as DocumentSummary[]
}

async function loadDocument(id: string): Promise<PdfDocument> {
  const response = await fetch(`/api/documents/${id}`)
  if (!response.ok) {
    throw new Error("Failed to load document")
  }
  return (await response.json()) as PdfDocument
}

async function saveDocument(input: {
  id: string | null
  title: string
  request: PdfRequest
}): Promise<PdfDocument> {
  const body = {
    title: input.title,
    engine: input.request.engine,
    design: input.request.design,
    data: input.request.data,
  }
  const response = await fetch(
    input.id ? `/api/documents/${input.id}` : "/api/documents",
    {
      method: input.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  )
  if (!response.ok) {
    const error = (await response.json()) as { message?: string }
    throw new Error(error.message ?? "Save failed")
  }
  return (await response.json()) as PdfDocument
}
