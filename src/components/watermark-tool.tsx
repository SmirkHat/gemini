import { useCallback, useEffect, useRef, useState } from "react"
import { Download, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { applyGeminiWatermark, preloadTemplates, type WatermarkResult } from "@/lib/gemini-watermark"

type Status = "idle" | "processing" | "done" | "error"

const MAX_FILE_SIZE = 50 * 1024 * 1024

function validateFile(file: File): string | null {
  if (!file.type.startsWith("image/") && file.type !== "") {
    return "Nejedná se o obrázek."
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Soubor je příliš velký (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum je 50 MB.`
  }
  return null
}

export function WatermarkTool() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<WatermarkResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  // Preload templates on mount
  useEffect(() => { preloadTemplates() }, [])

  const process = useCallback(async (file: File) => {
    const err = validateFile(file)
    if (err) { setError(err); setStatus("error"); return }

    setStatus("processing")
    setError("")

    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await loadImage(dataUrl)
      const res = await applyGeminiWatermark(img, file)
      const url = URL.createObjectURL(res.blob)
      setResult(res)
      setPreviewUrl(url)
      setStatus("done")
    } catch (e) {
      console.error(e)
      setError("Nepodařilo se zpracovat obrázek.")
      setStatus("error")
    }
  }, [])

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setStatus("idle")
    setResult(null)
    setPreviewUrl("")
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [previewUrl])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++; setDragging(true)
  }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) { dragCounter.current = 0; setDragging(false) }
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
  }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragging(false); dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    if (file) process(file)
  }, [process])

  // Ctrl+V paste
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      for (const item of e.clipboardData?.items ?? []) {
        if (item.type.startsWith("image/")) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) process(file)
          return
        }
      }
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [process])

  return (
    <div className="mx-auto max-w-2xl">
      {/* Upload */}
      {status !== "done" && (
        <div
          className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer
            ${dragging ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/50"}
            ${status === "processing" ? "pointer-events-none opacity-60" : ""}`}
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          onDragOver={handleDragOver} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button" tabIndex={0} aria-label="Nahrát obrázek"
        >
          <input ref={fileInputRef} type="file"
            accept="image/*"
            onChange={e => { const f = e.target.files?.[0]; if (f) process(f) }}
            className="hidden" />
          <div className="flex flex-col items-center gap-3">
            {status === "processing" ? (
              <>
                <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-lg font-medium text-muted-foreground">Zpracovávám…</p>
              </>
            ) : dragging ? (
              <>
                <Download className="size-10 text-primary animate-bounce" aria-hidden="true" />
                <p className="text-lg font-medium text-primary">Pusť obrázek sem</p>
              </>
            ) : (
              <>
                <Upload className="size-10 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-lg font-medium">Přetáhni sem obrázek nebo klikni</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jakýkoliv obrázek · max 50 MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <X className="size-4" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>Zkusit znovu</Button>
        </div>
      )}

      {/* Result */}
      {status === "done" && result && (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border bg-black">
            <img src={previewUrl} alt="Obrázek s vodoznakem" className="w-full" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => {
              const a = document.createElement("a")
              a.href = previewUrl
              a.download = result.filename
              a.click()
            }} size="lg">
              <Download className="mr-2 size-4" />
              Stáhnout {result.filename}
            </Button>
            <Button onClick={reset} variant="ghost" size="lg">
              <X className="mr-2 size-4" />
              Jiný obrázek
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = url
  })
}
