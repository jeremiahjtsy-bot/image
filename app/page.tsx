'use client'

import { useRef, useState } from 'react'
import { Check, CloudUpload, ImagePlus, LoaderCircle, X } from 'lucide-react'

type UploadItem = { id: string; name: string; url: string; size: string }

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function uploadFiles(selected: FileList | File[]) {
    const images = Array.from(selected).filter((file) => file.type.startsWith('image/'))
    if (!images.length) {
      setMessage('Choose an image file to upload.')
      return
    }
    const oversized = images.find((file) => file.size > 10 * 1024 * 1024)
    if (oversized) {
      setMessage(`${oversized.name} is larger than the 10 MB limit.`)
      return
    }

    setMessage('')
    setIsUploading(true)
    try {
      const uploaded = await Promise.all(images.map(async (file) => {
        const body = new FormData()
        body.append('file', file)
        const response = await fetch('/api/upload', { method: 'POST', body })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Upload failed')
        return { id: data.pathname, name: file.name, url: data.url, size: formatSize(file.size) }
      }))
      setFiles((current) => [...uploaded, ...current])
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded successfully.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><ImagePlus size={17} /></span><span>Image vault</span></div>
        <span className="status"><span className="status-dot" />Private workspace</span>
      </header>

      <section className="hero">
        <div className="eyebrow">Your visual library</div>
        <h1>Bring your images<br /><em>into focus.</em></h1>
        <p>Upload, organize, and keep every visual close at hand.</p>
      </section>

      <section className={`dropzone ${isDragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); uploadFiles(event.dataTransfer.files) }}>
        <div className="upload-icon"><CloudUpload size={25} /></div>
        <h2>{isDragging ? 'Drop them here' : 'Upload your images'}</h2>
        <p>Drag and drop or choose files from your device</p>
        <button className="primary-button" type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <><LoaderCircle className="spin" size={17} /> Uploading…</> : <><ImagePlus size={17} /> Choose images</>}
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(event) => event.target.files && uploadFiles(event.target.files)} />
        <span className="hint">PNG, JPG, WEBP, or GIF · up to 10 MB each</span>
      </section>

      {message && <div className={`message ${message.includes('successfully') ? 'success' : ''}`} role="status">{message.includes('successfully') && <Check size={16} />}{message}</div>}

      <section className="library-section">
        <div className="section-heading"><div><div className="eyebrow">Your collection</div><h2>{files.length ? `${files.length} image${files.length === 1 ? '' : 's'}` : 'Nothing here yet'}</h2></div>{files.length > 0 && <span className="count-badge">Latest first</span>}</div>
        {files.length === 0 ? <div className="empty-state"><ImagePlus size={22} /><span>Your uploaded images will appear here.</span></div> : <div className="gallery">{files.map((file) => <article className="image-card" key={file.id}><img src={file.url} alt={file.name} /><div className="image-meta"><div><strong>{file.name}</strong><span>{file.size}</span></div><a href={file.url} target="_blank" rel="noreferrer" aria-label={`Open ${file.name}`}><X size={16} /></a></div></article>)}</div>}
      </section>
    </main>
  )
}
