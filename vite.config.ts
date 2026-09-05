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
      const destinations = [
        join(process.cwd(), ".output/server/_libs"),
        join(
          process.cwd(),
          ".vercel/output/functions/__server.func/_libs",
        ),
      ]
      for (const destDir of destinations) {
        if (!existsSync(join(destDir, ".."))) {
          continue
        }
        mkdirSync(destDir, { recursive: true })
        copyFileSync(
          join(
            process.cwd(),
            "node_modules/@formepdf/core/pkg-node/forme_bg.wasm",
          ),
          join(destDir, "forme_bg.wasm"),
        )
        copyFileSync(
          join(
            process.cwd(),
            "node_modules/takumi-pdf/pkg/takumi_pdf_wasm_bg.wasm",
          ),
          join(destDir, "takumi_pdf_wasm_bg.wasm"),
        )
      }
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
