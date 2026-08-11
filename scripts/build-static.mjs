/**
 * Generate dist/client/index.html by rendering the app through the built
 * TanStack Start server bundle.
 *
 * This produces the *real* SSR output — full <head> with meta tags, the
 * `window.$_TSR` hydration payload (`$tsr-stream-barrier`), and the module
 * scripts — so React hydrates perfectly. A hand-written HTML shell crashes
 * hydration (no `$_TSR`), which is why the page used to flash and blank out.
 *
 * Usage: run after `vite build` (the server bundle must already exist).
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const serverBundle = join(root, "dist/server/server.js")
const outDir = join(root, "dist/client")
const outFile = join(outDir, "index.html")

// CJS interop: ns.default is module.exports, whose .default is the entry.
const ns = await import(`${serverBundle}`)
const entry = ns.default?.default ?? ns.default

if (!entry?.fetch) {
  throw new Error(
    "Server bundle has no fetch handler. Run `vite build` before build-static.",
  )
}

const request = new Request("http://localhost/", {
  headers: { accept: "text/html" },
})

const response = await entry.fetch(request, {})
if (!response.ok) {
  throw new Error(`SSR render failed: ${response.status} ${response.statusText}`)
}
const html = await response.text()

if (!html.includes("$_TSR")) {
  throw new Error("SSR output missing hydration payload — refusing to ship")
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, html)
console.log(`Generated static index.html via SSR (${html.length} bytes)`)
