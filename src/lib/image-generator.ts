import OpenAI from 'openai'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getUploadsDir, resolveStoredPath } from '@/lib/storage'

export interface LogoCompositeOptions {
  logoFilePath: string        // e.g. /uploads/logos/xgrc-master-white.png
  placement: string           // e.g. "Bottom-right or top-left"
  minClearSpace: string       // e.g. "5% of image width"
}

const PLACEMENT_MAP: Record<string, 'southeast' | 'southwest' | 'northeast' | 'northwest' | 'south' | 'north'> = {
  'bottom-right': 'southeast',
  'bottom-left': 'southwest',
  'top-right': 'northeast',
  'top-left': 'northwest',
  'bottom': 'south',
  'top': 'north',
}

function resolvePlacement(placement: string): 'southeast' | 'southwest' | 'northeast' | 'northwest' {
  const lower = placement.toLowerCase()
  if (lower.includes('bottom-right') || lower.includes('bottom right')) return 'southeast'
  if (lower.includes('bottom-left') || lower.includes('bottom left')) return 'southwest'
  if (lower.includes('top-left') || lower.includes('top left')) return 'northwest'
  if (lower.includes('top-right') || lower.includes('top right')) return 'northeast'
  // Default: bottom-right (spec preference)
  return 'southeast'
}

async function compositeLogoOntoImage(
  imageBuffer: Buffer,
  logoOptions: LogoCompositeOptions
): Promise<Buffer> {
  // Resolve logo file path
  const logoPublicPath = logoOptions.logoFilePath.startsWith('/')
    ? resolveStoredPath(logoOptions.logoFilePath)
    : logoOptions.logoFilePath

  if (!existsSync(logoPublicPath)) return imageBuffer

  const baseImage = sharp(imageBuffer)
  const metadata = await baseImage.metadata()
  const imageWidth = metadata.width || 1024
  const imageHeight = metadata.height || 1024

  // Logo width = 18% of image width, min 120px max 300px
  const logoWidth = Math.min(300, Math.max(120, Math.round(imageWidth * 0.18)))
  const margin = Math.round(imageWidth * 0.055)

  const gravity = resolvePlacement(logoOptions.placement)

  // Resize logo, preserve transparency
  const resizedLogo = await sharp(logoPublicPath)
    .resize(logoWidth, undefined, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer()

  const logoMeta = await sharp(resizedLogo).metadata()
  const logoH = logoMeta.height || 80

  // Calculate position based on gravity
  let left = 0
  let top = 0

  if (gravity === 'southeast') {
    left = imageWidth - logoWidth - margin
    top = imageHeight - logoH - margin
  } else if (gravity === 'southwest') {
    left = margin
    top = imageHeight - logoH - margin
  } else if (gravity === 'northeast') {
    left = imageWidth - logoWidth - margin
    top = margin
  } else {
    left = margin
    top = margin
  }

  const result = await baseImage
    .composite([{ input: resizedLogo, left, top }])
    .png({ compressionLevel: 8 })
    .toBuffer()

  return result
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function compositeTextOnImage(imageBuffer: Buffer, text: string): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata()
  const w = meta.width || 1024
  const h = meta.height || 1024

  const marginX = Math.round(w * 0.085)
  const marginY = Math.round(h * 0.105)
  const fontSize = Math.min(80, Math.max(44, Math.round(w * 0.056)))
  const textY = h - marginY

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ts" x="-10%" y="-60%" width="120%" height="220%">
        <feDropShadow dx="2" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.9"/>
      </filter>
    </defs>
    <text
      x="${marginX}"
      y="${textY}"
      font-family="Liberation Sans, Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="${fontSize}"
      fill="white"
      filter="url(#ts)"
    >${escapeXml(text)}</text>
  </svg>`

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ compressionLevel: 8 })
    .toBuffer()
}

// Strip C2PA/EXIF metadata that causes LinkedIn's AI-generated label
async function stripMetadata(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .png({ compressionLevel: 8 })
    // sharp strips all metadata (EXIF, XMP, IPTC, ICC) by default
    // This removes OpenAI's C2PA content credentials
    .toBuffer()
}

export async function generateImage(
  apiKey: string,
  prompt: string,
  postId?: string,
  logoOptions?: LogoCompositeOptions,
  imageText?: string
): Promise<{ imagePath: string; warning?: string }> {
  const client = new OpenAI({ apiKey })
  const timestamp = Date.now()
  const filename = postId ? `post-${postId}-${timestamp}.png` : `post-${timestamp}.png`
  const uploadsDir = getUploadsDir('images')
  await mkdir(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, filename)
  const publicPath = `/uploads/images/${filename}`

  let warning: string | undefined
  let imageBuffer: Buffer | null = null

  try {
    // Try gpt-image-1 first
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
    })

    const imageData = response.data?.[0]
    if (imageData?.b64_json) {
      imageBuffer = Buffer.from(imageData.b64_json, 'base64')
    } else if (imageData?.url) {
      const imgRes = await fetch(imageData.url)
      imageBuffer = Buffer.from(await imgRes.arrayBuffer())
    }
  } catch {
    // Fallback to dall-e-3
    try {
      warning = 'Using DALL-E 3 (gpt-image-1 unavailable)'
      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt: prompt.slice(0, 4000),
        n: 1,
        size: '1792x1024',
        response_format: 'b64_json',
      })

      const imageData = response.data?.[0]
      if (imageData?.b64_json) {
        imageBuffer = Buffer.from(imageData.b64_json, 'base64')
      } else if (imageData?.url) {
        const imgRes = await fetch(imageData.url)
        imageBuffer = Buffer.from(await imgRes.arrayBuffer())
      }
    } catch (e2) {
      throw new Error(`Image generation failed: ${e2}`)
    }
  }

  if (!imageBuffer) throw new Error('No image data received')

  // Strip AI metadata (removes C2PA content credentials → prevents LinkedIn AI label)
  imageBuffer = await stripMetadata(imageBuffer)

  // Composite text overlay programmatically — more reliable than asking AI to render text
  if (imageText?.trim()) {
    try {
      imageBuffer = await compositeTextOnImage(imageBuffer, imageText.trim())
    } catch {
      warning = (warning ? warning + '; ' : '') + 'Text compositing failed'
    }
  }

  // Composite logo onto image if a logo file path is provided
  if (logoOptions?.logoFilePath) {
    try {
      imageBuffer = await compositeLogoOntoImage(imageBuffer, logoOptions)
    } catch {
      warning = (warning ? warning + '; ' : '') + 'Logo compositing failed — image saved without logo'
    }
  }

  await writeFile(filePath, imageBuffer)
  return { imagePath: publicPath, warning }
}
