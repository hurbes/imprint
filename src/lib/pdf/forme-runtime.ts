import { init, renderSerializedDoc } from "@formepdf/core/worker"
import { serialize } from "@formepdf/react"
import type { ReactElement } from "react"

import { readWasmBytes } from "./wasm-bytes"

let ready: Promise<void> | undefined

async function ensureForme(): Promise<void> {
  ready ??= init(
    readWasmBytes(
      "@formepdf/core/pkg-web/forme_bg.wasm",
      "forme_bg.wasm",
    ),
  )
  await ready
}

export async function renderForme(element: ReactElement): Promise<Uint8Array> {
  await ensureForme()
  return renderSerializedDoc(serialize(element) as Record<string, unknown>)
}
