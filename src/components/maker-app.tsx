import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  FileTextIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  Trash2Icon,
} from "lucide-react"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
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
import { APP_NAME } from "@/lib/brand"
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
const documentsCollapsedSize = 56
const documentsExpandedSize = 200

const renderModes = [
  {
    value: "takumi-template",
    label: "Takumi, template",
    engine: "takumi",
    designKind: "template",
  },
  {
    value: "takumi-html",
    label: "Takumi, HTML",
    engine: "takumi",
    designKind: "html",
  },
  {
    value: "forme-template",
    label: "Forme, template",
    engine: "forme",
    designKind: "template",
  },
] as const

type RenderMode = (typeof renderModes)[number]["value"]

function renderModeFor(
  engine: Engine,
  designKind: "template" | "html",
): RenderMode {
  if (engine === "forme") {
    return "forme-template"
  }
  if (designKind === "html") {
    return "takumi-html"
  }
  return "takumi-template"
}

export function MakerApp() {
  const queryClient = useQueryClient()
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [title, setTitle] = useState("Untitled")
  const [engine, setEngine] = useState<Engine>("takumi")
  const [templateName, setTemplateName] = useState<TemplateName>("invoice-classic")
  const [designKind, setDesignKind] = useState<"template" | "html">("template")
  const [markup, setMarkup] = useState("<div>Hello</div>")
  const [dataText, setDataText] = useState(
    JSON.stringify(templateCatalog["invoice-classic"].sampleData, null, 2),
  )
  const [debouncedPayload, setDebouncedPayload] = useState<unknown>(null)
  const [documentsCollapsed, setDocumentsCollapsed] = useState(true)
  const documentsPanelRef = useRef<PanelImperativeHandle>(null)

  useEffect(() => {
    const label = title.trim() || "Untitled"
    document.title = `${label} — ${APP_NAME}`
  }, [title])

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

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: (_result, id) => {
      if (id === documentId) {
        resetEditor()
      }
      toast.success("Deleted")
      void queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Delete failed")
    },
  })

  const previewUrl = previewQuery.data?.url
  const previewPending = previewQuery.isFetching || !debouncedPayload
  const savePending = saveMutation.isPending
  const downloadPending = downloadMutation.isPending

  function toggleDocuments() {
    const panel = documentsPanelRef.current
    if (!panel) {
      return
    }
    if (panel.isCollapsed()) {
      panel.resize(documentsExpandedSize)
    } else {
      panel.collapse()
    }
  }

  function resetEditor() {
    setDocumentId(null)
    setTitle("Untitled")
    setEngine("takumi")
    setTemplateName("invoice-classic")
    setDesignKind("template")
    setMarkup("<div>Hello</div>")
    setDataText(
      JSON.stringify(templateCatalog["invoice-classic"].sampleData, null, 2),
    )
  }

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
    <div className="h-svh p-4">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel
          className="min-h-0"
          collapsedSize={documentsCollapsedSize}
          collapsible
          defaultSize={documentsCollapsedSize}
          maxSize={260}
          minSize={168}
          panelRef={documentsPanelRef}
          onResize={(size) => {
            setDocumentsCollapsed(size.inPixels <= documentsCollapsedSize + 1)
          }}
        >
          <Card className="flex h-full min-h-0 flex-col" size="sm">
            {documentsCollapsed ? (
              <CardContent className="flex flex-1 flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Show documents"
                  onClick={toggleDocuments}
                >
                  <PanelLeftOpenIcon />
                </Button>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Saved on this device.</CardDescription>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Hide documents"
                      onClick={toggleDocuments}
                    >
                      <PanelLeftCloseIcon />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
                  <Button variant="outline" onClick={resetEditor}>
                    New
                  </Button>
                  <Separator />
                  <ScrollArea className="min-h-0 flex-1">
                    {documentsQuery.data && documentsQuery.data.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {documentsQuery.data.map((document) => (
                          <div key={document.id} className="flex items-center gap-1">
                            <Button
                              variant={
                                document.id === documentId ? "secondary" : "ghost"
                              }
                              className="min-w-0 flex-1 justify-start"
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
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Delete ${document.title}`}
                              disabled={
                                deleteMutation.isPending &&
                                deleteMutation.variables === document.id
                              }
                              onClick={() => deleteMutation.mutate(document.id)}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
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
              </>
            )}
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="32%" minSize="22%" maxSize="50%" className="min-h-0">
          <Card className="flex h-full min-h-0 flex-col">
        <CardHeader>
          <CardTitle>Design and data</CardTitle>
          <CardDescription>
            Same payload an agent posts to /api/pdf.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
          <FieldGroup>
            <Field>
              <FieldLabel>Engine</FieldLabel>
              <Select
                value={renderModeFor(engine, designKind)}
                onValueChange={(value) => {
                  if (typeof value !== "string") {
                    return
                  }
                  const mode = renderModes.find((option) => option.value === value)
                  if (!mode) {
                    return
                  }
                  setEngine(mode.engine)
                  setDesignKind(mode.designKind)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {
                      renderModes.find(
                        (mode) =>
                          mode.value === renderModeFor(engine, designKind),
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {renderModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
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
                    size="sm"
                    variant="outline"
                    disabled={
                      downloadPending || isPdfFailure(parsePdfRequest(requestJson))
                    }
                    onClick={() => downloadMutation.mutate()}
                  >
                    {downloadPending ? (
                      <Spinner data-icon="inline-start" />
                    ) : null}
                    Download
                  </Button>
                </div>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
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
        </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%" minSize="28%" className="min-h-0">
          <Card className="flex h-full min-h-0 flex-col">
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
        </ResizablePanel>
      </ResizablePanelGroup>
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

async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, { method: "DELETE" })
  if (!response.ok) {
    const error = (await response.json()) as { message?: string }
    throw new Error(error.message ?? "Delete failed")
  }
}
