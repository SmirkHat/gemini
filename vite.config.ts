import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  server: {
    port: 3003,
    // allow access via mDNS hostnames on the local network (e.g. mymachine.local)
    allowedHosts: [".local"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    // tanstackStart() must come before viteReact()
    tanstackStart(),
    viteReact(),
  ],
})
