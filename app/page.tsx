import { list } from '@vercel/blob'
import Gallery from './gallery'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { blobs } = await list({
    prefix: 'uploads/',
  })
  const initialImages = blobs
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .map((blob) => ({ id: blob.pathname, name: blob.pathname.split('/').pop() || 'image', url: blob.url, size: blob.size }))

  return <Gallery initialImages={initialImages} />
}
