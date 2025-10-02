import { render, screen } from '@testing-library/react'
import GoogleMapsEmbed from '../GoogleMapsEmbed'

// Mock environment variable
const originalEnv = process.env
beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
})

describe('GoogleMapsEmbed', () => {
  const testAddress = 'Národní třída 10, Praha 1'

  it('renders iframe when API key is available', () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'
    
    render(<GoogleMapsEmbed address={testAddress} />)
    
    const iframe = screen.getByTitle(`Mapa pro ${testAddress}`)
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('google.com/maps/embed'))
    expect(iframe).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(testAddress)))
  })

  it('renders fallback link when API key is not available', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    render(<GoogleMapsEmbed address={testAddress} />)
    
    expect(screen.getByText('Zobrazit na mapě:')).toBeInTheDocument()
    
    const link = screen.getByRole('link', { name: /otevřít v google maps/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps/search'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('applies custom className and height', () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'
    
    render(
      <GoogleMapsEmbed 
        address={testAddress} 
        className="custom-class"
        height="400px"
      />
    )
    
    const iframe = screen.getByTitle(`Mapa pro ${testAddress}`)
    expect(iframe).toHaveClass('custom-class')
    expect(iframe).toHaveStyle({ height: '400px' })
  })

  it('encodes address properly for URL', () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'
    const addressWithSpecialChars = 'Náměstí Míru 5, Praha 2'
    
    render(<GoogleMapsEmbed address={addressWithSpecialChars} />)
    
    const iframe = screen.getByTitle(`Mapa pro ${addressWithSpecialChars}`)
    expect(iframe).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(addressWithSpecialChars)))
  })
})
