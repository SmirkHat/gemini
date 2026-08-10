import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const preset = process.env.VERCEL ? "vercel" : "node-server"

export default defineConfig({
  server: {
    port: 3003,
    allowedHosts: [".local"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({ server: { preset } }),
    viteReact(),
  ],
})
