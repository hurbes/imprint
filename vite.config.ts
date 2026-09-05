import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { defineConfig, type Plugin } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

function copyPdfWasm(): Plugin {
  return {
    name: "copy-pdf-wasm",
    apply: "build",
    closeBundle() {
      const serverDir = join(process.cwd(), ".output/server/_libs")
      if (!existsSync(join(process.cwd(), ".output/server"))) {
        return
      }
      mkdirSync(serverDir, { recursive: true })
      copyFileSync(
        join(
          process.cwd(),
          "node_modules/@formepdf/core/pkg-node/forme_bg.wasm",
        ),
        join(serverDir, "forme_bg.wasm"),
      )
      copyFileSync(
        join(
          process.cwd(),
          "node_modules/takumi-pdf/pkg/takumi_pdf_wasm_bg.wasm",
        ),
        join(serverDir, "takumi_pdf_wasm_bg.wasm"),
      )
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    external: ["bun:sqlite", "takumi-pdf", "@formepdf/core", "@formepdf/react"],
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    copyPdfWasm(),
  ],
})

export default config
