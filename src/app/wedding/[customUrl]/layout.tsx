import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  params: Promise<{
    customUrl: string
  }>
}

export default async function WeddingWebsiteLayout({ children, params }: LayoutProps) {
  // Tento layout je pro veřejný svatební web
  // Nemá hlavní navigaci aplikace, je to standalone web

  // Await params (required in Next.js 16)
  await params

  return (
    <div className="wedding-website">
      {children}
    </div>
  )
}

