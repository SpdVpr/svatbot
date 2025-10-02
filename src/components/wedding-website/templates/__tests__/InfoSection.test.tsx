import { render } from '@testing-library/react'
import InfoSection from '../classic/InfoSection'
import ModernInfoSection from '../modern/InfoSection'
import type { InfoContent } from '@/types/wedding-website'

// Mock the GoogleMapsEmbed component
jest.mock('../../GoogleMapsEmbed', () => {
  return function MockGoogleMapsEmbed({ address }: { address: string }) {
    return <div data-testid="google-maps-embed">Map for {address}</div>
  }
})

describe('InfoSection Layout', () => {
  const baseContent: InfoContent = {
    enabled: true,
  }

  describe('Classic InfoSection', () => {
    it('uses single column layout when only ceremony is filled', () => {
      const content: InfoContent = {
        ...baseContent,
        ceremony: {
          venue: 'Test Venue',
          time: '14:00',
          address: 'Test Address'
        }
      }

      const { container } = render(<InfoSection content={content} />)
      
      // Should use single column grid (no lg:grid-cols-2)
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).not.toHaveClass('lg:grid-cols-2')
    })

    it('uses single column layout when only reception is filled', () => {
      const content: InfoContent = {
        ...baseContent,
        reception: {
          venue: 'Test Reception',
          time: '18:00',
          address: 'Reception Address'
        }
      }

      const { container } = render(<InfoSection content={content} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).not.toHaveClass('lg:grid-cols-2')
    })

    it('uses two column layout when both ceremony and reception are filled', () => {
      const content: InfoContent = {
        ...baseContent,
        ceremony: {
          venue: 'Test Venue',
          time: '14:00',
          address: 'Test Address'
        },
        reception: {
          venue: 'Test Reception',
          time: '18:00',
          address: 'Reception Address'
        }
      }

      const { container } = render(<InfoSection content={content} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).toHaveClass('lg:grid-cols-2')
    })
  })

  describe('Modern InfoSection', () => {
    it('uses single column layout when only ceremony is filled', () => {
      const content: InfoContent = {
        ...baseContent,
        ceremony: {
          venue: 'Test Venue',
          time: '14:00',
          address: 'Test Address'
        }
      }

      const { container } = render(<ModernInfoSection content={content} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).not.toHaveClass('lg:grid-cols-2')
    })

    it('uses two column layout when both venues are filled', () => {
      const content: InfoContent = {
        ...baseContent,
        ceremony: {
          venue: 'Test Venue',
          time: '14:00',
          address: 'Test Address'
        },
        reception: {
          venue: 'Test Reception',
          time: '18:00',
          address: 'Reception Address'
        }
      }

      const { container } = render(<ModernInfoSection content={content} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).toHaveClass('lg:grid-cols-2')
    })
  })
})
