import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { Database } from "bun:sqlite"

import type {
  DocumentDraft,
  DocumentSummary,
  PdfDesign,
  PdfDocument,
} from "./types"
import { isEngine } from "./types"

type DocumentRow = {
  id: string
  title: string
  engine: string
  design_json: string
  data_json: string
  created_at: number
  updated_at: number
}

export type DocumentStore = {
  create: (input: DocumentDraft) => PdfDocument
  get: (id: string) => PdfDocument | null
  list: () => DocumentSummary[]
  update: (
    id: string,
    patch: Partial<Pick<PdfDocument, "title" | "engine" | "design" | "data">>,
  ) => PdfDocument | null
}

export function createDocumentStore(dbPath: string): DocumentStore {
  mkdirSync(dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      engine TEXT NOT NULL,
      design_json TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  const insert = db.query(`
    INSERT INTO documents (
      id, title, engine, design_json, data_json, created_at, updated_at
    ) VALUES ($id, $title, $engine, $design_json, $data_json, $created_at, $updated_at)
  `)
  const selectById = db.query(`SELECT * FROM documents WHERE id = $id`)
  const selectAll = db.query(
    `SELECT id, title, engine, updated_at FROM documents ORDER BY updated_at DESC`,
  )
  const updateRow = db.query(`
    UPDATE documents
    SET title = $title,
        engine = $engine,
        design_json = $design_json,
        data_json = $data_json,
        updated_at = $updated_at
    WHERE id = $id
  `)

  return {
    create(input) {
      const now = Date.now()
      const document: PdfDocument = {
        id: crypto.randomUUID(),
        title: input.title,
        engine: input.engine,
        design: input.design,
        data: input.data,
        createdAt: now,
        updatedAt: now,
      }
      insert.run({
        $id: document.id,
        $title: document.title,
        $engine: document.engine,
        $design_json: JSON.stringify(document.design),
        $data_json: JSON.stringify(document.data),
        $created_at: document.createdAt,
        $updated_at: document.updatedAt,
      })
      return document
    },
    get(id) {
      const row = selectById.get({ $id: id }) as DocumentRow | null
      return row ? toDocument(row) : null
    },
    list() {
      const rows = selectAll.all() as Array<{
        id: string
        title: string
        engine: string
        updated_at: number
      }>
      return rows.flatMap((row) => {
        if (!isEngine(row.engine)) {
          return []
        }
        return [
          {
            id: row.id,
            title: row.title,
            engine: row.engine,
            updatedAt: row.updated_at,
          },
        ]
      })
    },
    update(id, patch) {
      const current = this.get(id)
      if (!current) {
        return null
      }
      const next: PdfDocument = {
        ...current,
        title: patch.title ?? current.title,
        engine: patch.engine ?? current.engine,
        design: patch.design ?? current.design,
        data: patch.data ?? current.data,
        updatedAt: Date.now(),
      }
      updateRow.run({
        $id: next.id,
        $title: next.title,
        $engine: next.engine,
        $design_json: JSON.stringify(next.design),
        $data_json: JSON.stringify(next.data),
        $updated_at: next.updatedAt,
      })
      return next
    },
  }
}

function toDocument(row: DocumentRow): PdfDocument | null {
  if (!isEngine(row.engine)) {
    return null
  }
  return {
    id: row.id,
    title: row.title,
    engine: row.engine,
    design: JSON.parse(row.design_json) as PdfDesign,
    data: JSON.parse(row.data_json) as Record<string, unknown>,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

let appStore: DocumentStore | undefined

export function getAppDocumentStore(): DocumentStore {
  if (!appStore) {
    appStore = createDocumentStore(
      `${process.cwd()}/data/pdf-maker.sqlite`,
    )
  }
  return appStore
}
