/**
 * Gemini template‑overlay watermark engine.
 *
 * Templates are preloaded and pre‑revealed on first use — subsequent
 * watermarks skip all pixel work and just composite via drawImage.
 */

import { buildPng, parsePngChunks, type PngChunk } from "./png-chunks"

const MAX_DIMENSION = 2048
const TEMPLATE_OPACITY = 0.75
const BRIGHTNESS_THRESHOLD = 10

export interface WatermarkOptions {
  template?: "auto" | "square" | "landscape" | "portrait"
}

export interface WatermarkResult {
  blob: Blob
  filename: string
  template: string
}

interface TemplateDef {
  id: string
  path: string
  aspect: number
  bucket: "square" | "landscape" | "portrait"
}

interface CachedTemplate {
  def: TemplateDef
  /** Pre‑revealed canvas — white design on transparent, ready to composite */
  revealed: HTMLCanvasElement
  /** Raw PNG buffer for metadata extraction */
  buffer: ArrayBuffer
}

const TEMPLATES: TemplateDef[] = [
  { id: "1:1", path: "/templates/square.png", aspect: 1, bucket: "square" },
  { id: "16:9", path: "/templates/landscape.png", aspect: 16 / 9, bucket: "landscape" },
  { id: "9:16", path: "/templates/portrait.png", aspect: 9 / 16, bucket: "portrait" },
]

// Lazy cache — populated on first use (browser only)
let _cache: Promise<CachedTemplate[]> | null = null

function getCache(): Promise<CachedTemplate[]> {
  if (!_cache) {
    _cache = Promise.all(TEMPLATES.map(async (def) => {
      const [img, buffer] = await Promise.all([
        loadImage(def.path),
        fetch(def.path).then(r => r.arrayBuffer()),
      ])
      const revealed = reveal(img)
      return { def, revealed, buffer }
    }))
  }
  return _cache
}

/** Trigger preloading (call early, don't await). */
export function preloadTemplates(): void {
  getCache()
}

/**
 * Apply the Gemini template overlay to an image.
 *
 * 1. Picks the best template for the photo's aspect ratio.
 * 2. Reveals the template's hidden RGB design (alpha‑adjusted).
 * 3. Composites: photo → template overlay on top.
 * 4. Caps output to 2048 px on the longest side.
 * 5. Preserves C2PA metadata from both original image and template.
 */
export async function applyGeminiWatermark(
  image: HTMLImageElement,
  originalFile: File,
  options: WatermarkOptions = {},
): Promise<WatermarkResult> {
  const photoW = image.naturalWidth
  const photoH = image.naturalHeight
  const photoAspect = photoW / photoH

  // Pick template from preloaded cache
  const templates = await getCache()
  const cached = templates.find(t => t.def.bucket === pickTemplate(photoAspect, options.template ?? "auto").bucket)!

  // Output size = template's native resolution (capped)
  const outW = Math.min(cached.revealed.width, MAX_DIMENSION)
  const outH = Math.min(cached.revealed.height, MAX_DIMENSION)

  // Composite
  const canvas = document.createElement("canvas")
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext("2d")!

  // Black background for any transparent areas
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, outW, outH)

  // Draw photo scaled to fill the template frame
  const photoAspectRatio = photoW / photoH
  const canvasAspect = outW / outH

  let pDrawW: number, pDrawH: number, pDrawX: number, pDrawY: number

  if (photoAspectRatio > canvasAspect) {
    // Photo wider  -  fit by height, crop sides
    pDrawH = outH
    pDrawW = outH * photoAspectRatio
    pDrawX = -(pDrawW - outW) / 2
    pDrawY = 0
  } else {
    // Photo taller  -  fit by width, crop top/bottom
    pDrawW = outW
    pDrawH = outW / photoAspectRatio
    pDrawX = 0
    pDrawY = -(pDrawH - outH) / 2
  }

  ctx.drawImage(image, pDrawX, pDrawY, pDrawW, pDrawH)

  // Draw pre-revealed template at native size
  ctx.globalAlpha = TEMPLATE_OPACITY
  ctx.drawImage(cached.revealed, 0, 0, outW, outH)
  ctx.globalAlpha = 1

  // Subtle noise — gives the AI-generated look
  addNoise(ctx, outW, outH)

  // Metadata
  const watermarkedBlob = await canvasToBlob(canvas)
  const watermarkedBuffer = await blobToArrayBuffer(watermarkedBlob)

  const originalBuffer = await readFileAsArrayBuffer(originalFile)

  const finalBuffer = mergeMetadata(watermarkedBuffer, originalBuffer, cached.buffer)

  const blob = new Blob([finalBuffer], { type: "image/png" })
  const filename = generateGeminiFilename()

  return { blob, filename, template: cached.def.id }
}

// --- Template selection ---

function pickTemplate(photoAspect: number, mode: string): TemplateDef {
  if (mode !== "auto") {
    const t = TEMPLATES.find((t) => t.bucket === mode)
    if (t) return t
  }

  // Pick geometrically closest template by aspect-ratio distance
  let best = TEMPLATES[0]!
  let bestDist = Math.abs(Math.log(photoAspect / best.aspect))
  for (let i = 1; i < TEMPLATES.length; i++) {
    const dist = Math.abs(Math.log(photoAspect / TEMPLATES[i]!.aspect))
    if (dist < bestDist) {
      bestDist = dist
      best = TEMPLATES[i]!
    }
  }
  return best
}

// --- Template revealing ---

/**
 * Convert a template image from "hidden RGB / alpha=0" to
 * "white design on transparent background".
 *
 * The Gemini templates encode the sparkle design in the RGB channels
 * with alpha set to 0 (fully transparent). This function makes the
 * design visible by setting alpha proportional to RGB brightness.
 */
function reveal(img: HTMLImageElement): HTMLCanvasElement {
  const w = img.naturalWidth
  const h = img.naturalHeight

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, w, h)
  const pixels = imageData.data

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]!
    const g = pixels[i + 1]!
    const b = pixels[i + 2]!
    const brightness = r + g + b

    if (brightness > BRIGHTNESS_THRESHOLD) {
      // Design pixel: make it white with brightness-derived alpha
      pixels[i] = 255
      pixels[i + 1] = 255
      pixels[i + 2] = 255
      // Map brightness to alpha: scale so brightest pixels are 255
      const alpha = Math.min(255, Math.round((brightness / 765) * 255))
      pixels[i + 3] = alpha
    } else {
      // Background pixel: fully transparent
      pixels[i + 3] = 0
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// --- Noise ---

/**
 * Apply AI‑generation‑style artifacts: harsh grain, slight posterization,
 * and micro‑blocking — the kind of texture real diffusion models leave behind.
 */
function addNoise(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data

  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const grain = (Math.random() - 0.5) * 4  // ±2 levels
      const val = (d[i + c] ?? 0) + grain
      d[i + c] = Math.min(255, Math.max(0, Math.round(val)))
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// --- Metadata preservation ---

/**
 * Merge ancillary chunks from both the original photo's PNG and the
 * Gemini template's PNG into the watermarked output.
 */
function mergeMetadata(
  watermarkedBuffer: ArrayBuffer,
  originalBuffer: ArrayBuffer,
  templateBuffer: ArrayBuffer,
): ArrayBuffer {
  let originalChunks: PngChunk[] | null = null
  let templateChunks: PngChunk[] | null = null

  try {
    originalChunks = parsePngChunks(originalBuffer)
  } catch { /* not valid PNG */ }
  try {
    templateChunks = parsePngChunks(templateBuffer)
  } catch { /* not valid PNG */ }

  const ancillary: PngChunk[] = []

  if (originalChunks) {
    ancillary.push(...filterAncillary(originalChunks))
  }
  if (templateChunks) {
    // Template C2PA data proves Gemini involvement
    ancillary.push(...filterAncillary(templateChunks))
  }

  if (ancillary.length === 0) return watermarkedBuffer

  const watermarked = parsePngChunks(watermarkedBuffer)
  const result: PngChunk[] = []

  for (const chunk of watermarked) {
    if (chunk.type === "IHDR") {
      result.push(chunk)
      result.push(...ancillary)
    } else if (chunk.type === "IDAT" || chunk.type === "IEND") {
      result.push(chunk)
    }
  }

  return buildPng(result).buffer as ArrayBuffer
}

const SKIP_CHUNKS = new Set([
  "IHDR", "PLTE", "IDAT", "IEND",
  "sRGB", "gAMA", "cHRM", "bKGD",
])

function filterAncillary(chunks: PngChunk[]): PngChunk[] {
  return chunks.filter((c) => !SKIP_CHUNKS.has(c.type))
}

// --- Helpers ---

function generateGeminiFilename(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let random = ""
  for (let i = 0; i < 16; i++) {
    random += chars[Math.floor(Math.random() * chars.length)]
  }
  return `Gemini_Generated_Image_${random}.png`
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Canvas toBlob failed"))
    }, "image/png")
  })
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error("Failed to read blob"))
    reader.readAsArrayBuffer(blob)
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}
