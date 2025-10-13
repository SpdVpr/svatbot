'use client'

import { ReactNode, Children, cloneElement, isValidElement } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number // delay between each item in ms
}

export default function StaggerContainer({
  children,
  className = '',
  staggerDelay = 50
}: StaggerContainerProps) {
  const childrenArray = Children.toArray(children)

  return (
    <div className={className}>
      {childrenArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child as React.ReactElement<any>, {
            key: index,
            className: `${child.props.className || ''} stagger-item`,
            style: {
              ...child.props.style,
              animationDelay: `${index * staggerDelay}ms`
            }
          })
        }
        return child
      })}
    </div>
  )
}

