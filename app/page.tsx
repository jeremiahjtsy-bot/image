import Gallery from './gallery'

export default function Home() {
  // Blob credentials are only available to server routes in the deployed app.
  // Start empty so the preview can render without trying to list the store in RSC.
  return <Gallery initialImages={[]} />
}
