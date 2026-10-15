import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are supported.' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Images must be 10 MB or smaller.' }, { status: 413 })

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
    const blob = await put(`uploads/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: false,
      storeId: process.env.BLOB_STORE_ID,
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
    })
    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    console.error('[v0] Image upload failed:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
