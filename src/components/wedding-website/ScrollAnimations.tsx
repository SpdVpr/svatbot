'use client'

import { useEffect } from 'react'

export default function ScrollAnimations() {
  useEffect(() => {
    const animationClasses = [
      'scale-in',
      'slide-in-left',
      'slide-in-right',
      'slide-in-bottom',
      'bounce-in',
      'rotate-in',
      'flip-in',
      'elastic-bounce',
      'stagger-item',
      'fade-in',
      'zoom-in',
      'slide-up'
    ]

    const elements: Element[] = []
    animationClasses.forEach(className => {
      elements.push(...Array.from(document.querySelectorAll(`.${className}`)))
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    elements.forEach((element) => {
      element.classList.add('animate-ready')
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
