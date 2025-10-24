import ClassicContactSection from '../classic/ContactSection'
import type { ContactContent, HeroContent } from '@/types/wedding-website'

interface ContactSectionProps {
  content: ContactContent
  heroContent: HeroContent
}

export default function ContactSection({ content, heroContent }: ContactSectionProps) {
  return <ClassicContactSection content={content} heroContent={heroContent} />
}

