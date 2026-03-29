import { ContentBridge } from '@/components/content-bridge'
import { Toaster } from '@/components/ui/sonner'

export default function Home() {
  return (
    <>
      <ContentBridge />
      <Toaster position="bottom-right" />
    </>
  )
}
