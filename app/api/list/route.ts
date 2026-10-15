import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: 'uploads/',
    })

    return NextResponse.json({
      files: blobs.map((blob) => ({
        id: blob.pathname,
        name: blob.pathname.split('/').pop() || 'image',
        url: blob.url,
        size: blob.size,
      })),
    })
  } catch (error) {
    console.error('[v0] Image listing failed:', error)
    return NextResponse.json({ error: 'Unable to load your images.' }, { status: 500 })
  }
}
