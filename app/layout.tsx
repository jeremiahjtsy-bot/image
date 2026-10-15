import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Image Vault', description: 'Upload and keep your visual library close at hand.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
