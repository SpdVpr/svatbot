import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  params: {
    customUrl: string
  }
}

export default function WeddingWebsiteLayout({ children, params }: LayoutProps) {
  // Tento layout je pro veřejný svatební web
  // Nemá hlavní navigaci aplikace, je to standalone web
  
  return (
    <div className="wedding-website">
      {children}
    </div>
  )
}

