/**
 * PNG chunk-level manipulation utilities.
 *
 * Parses raw PNG bytes into chunks and reconstructs a valid PNG from a list
 * of chunks. Used to preserve ancillary metadata (C2PA, EXIF, text) from the
 * original image when the canvas API strips it during watermarking.
 */

export interface PngChunk {
  type: string
  data: Uint8Array
  crc: Uint8Array
}

const SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

/**
 * Parse a PNG buffer into its constituent chunks.
 */
export function parsePngChunks(buffer: ArrayBuffer): PngChunk[] {
  const bytes = new Uint8Array(buffer)
  if (!hasPngSignature(bytes)) {
    throw new Error("Not a valid PNG file")
  }

  const chunks: PngChunk[] = []
  let offset = 8 // skip signature

  while (offset < bytes.length) {
    const length = readUint32(bytes, offset)
    offset += 4

    const type = String.fromCharCode(
      bytes[offset]!,
      bytes[offset + 1]!,
      bytes[offset + 2]!,
      bytes[offset + 3]!,
    )
    offset += 4

    const data = bytes.slice(offset, offset + length)
    offset += length

    const crc = bytes.slice(offset, offset + 4)
    offset += 4

    chunks.push({ type, data, crc })

    if (type === "IEND") break
  }

  return chunks
}

/**
 * Reconstruct a PNG buffer from a list of chunks.
 */
export function buildPng(chunks: PngChunk[]): Uint8Array {
  let totalSize = 8 // signature

  for (const chunk of chunks) {
    totalSize += 4 + 4 + chunk.data.length + 4 // length + type + data + crc
  }

  const result = new Uint8Array(totalSize)
  result.set(SIG, 0)

  let offset = 8
  for (const chunk of chunks) {
    writeUint32(result, offset, chunk.data.length)
    offset += 4

    for (let i = 0; i < 4; i++) {
      result[offset + i] = chunk.type.charCodeAt(i)
    }
    offset += 4

    result.set(chunk.data, offset)
    offset += chunk.data.length

    result.set(chunk.crc, offset)
    offset += 4
  }

  return result
}

/**
 * Insert ancillary chunks from the original PNG into the watermarked PNG.
 *
 * Ancillary chunks are those we want to preserve: caBX (C2PA), eXIf (EXIF),
 * tEXt, iTXt, zTXt (text metadata). Critical chunks (IHDR, PLTE, IDAT, IEND)
 * come from the watermarked canvas output.
 */
export function preserveAncillaryChunks(
  watermarkedPng: ArrayBuffer,
  originalChunks: PngChunk[],
): Uint8Array {
  const watermarked = parsePngChunks(watermarkedPng)

  // Extract ancillary chunks from original (keep only metadata chunks)
  const ancillary = originalChunks.filter(
    (c) =>
      !["IHDR", "PLTE", "IDAT", "IEND", "sRGB", "gAMA", "cHRM", "bKGD"].includes(
        c.type,
      ),
  )

  // Build result: IHDR + ancillary + IDATs + IEND
  const result: PngChunk[] = []

  for (const chunk of watermarked) {
    if (chunk.type === "IHDR") {
      result.push(chunk)
      // Insert ancillary chunks right after IHDR
      result.push(...ancillary)
    } else if (chunk.type === "IEND") {
      result.push(chunk)
    } else if (chunk.type === "IDAT") {
      result.push(chunk)
    }
    // Skip any sRGB/gAMA etc.  -  we just use the watermarked ones
  }

  return buildPng(result)
}

function hasPngSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== SIG[i]) return false
  }
  return true
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset]! << 24) |
      (bytes[offset + 1]! << 16) |
      (bytes[offset + 2]! << 8) |
      bytes[offset + 3]!) >>>
    0
  )
}

function writeUint32(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = (value >>> 24) & 0xff
  bytes[offset + 1] = (value >>> 16) & 0xff
  bytes[offset + 2] = (value >>> 8) & 0xff
  bytes[offset + 3] = value & 0xff
}
