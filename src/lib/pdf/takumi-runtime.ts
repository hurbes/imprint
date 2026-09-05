import {
  initSync,
  PdfRenderer,
  type RenderOptions,
} from "takumi-pdf/no-init"

import { readWasmBytes } from "./wasm-bytes"

let ready = false

function ensureTakumi(): void {
  if (ready) {
    return
  }
  initSync({
    module: readWasmBytes(
      "takumi-pdf/takumi_pdf_wasm_bg.wasm",
      "takumi_pdf_wasm_bg.wasm",
    ),
  })
  ready = true
}

export async function renderTakumi(
  node: Parameters<PdfRenderer["render"]>[0],
  options?: RenderOptions,
): Promise<Uint8Array> {
  ensureTakumi()
  const renderer = new PdfRenderer()
  try {
    return await renderer.render(node, options)
  } finally {
    renderer.free()
  }
}
