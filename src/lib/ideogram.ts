/**
 * Ideogram.ai API Client
 * Documentation: https://ideogram.ai/developer
 */

export interface IdeogramGenerateRequest {
  image_request: {
    prompt: string
    aspect_ratio?: 'ASPECT_10_16' | 'ASPECT_16_10' | 'ASPECT_9_16' | 'ASPECT_16_9' | 'ASPECT_3_2' | 'ASPECT_2_3' | 'ASPECT_4_3' | 'ASPECT_3_4' | 'ASPECT_1_1' | 'ASPECT_1_3' | 'ASPECT_3_1'
    model?: 'V_2' | 'V_2_TURBO'
    magic_prompt_option?: 'AUTO' | 'ON' | 'OFF'
    seed?: number
    style_type?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME'
    negative_prompt?: string
  }
}

export interface IdeogramGenerateResponse {
  created: string
  data: Array<{
    url: string
    prompt: string
    resolution: string
    is_image_safe: boolean
    seed: number
  }>
}

export interface IdeogramRemixRequest {
  image_request: {
    prompt: string
    image_file?: File | Blob
    image_url?: string
    aspect_ratio?: string
    model?: 'V_2' | 'V_2_TURBO'
    magic_prompt_option?: 'AUTO' | 'ON' | 'OFF'
    style_type?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME'
  }
}

export class IdeogramClient {
  private apiKey: string
  private baseUrl = 'https://api.ideogram.ai'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Ideogram API key is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Generate image from text prompt
   */
  async generate(request: IdeogramGenerateRequest): Promise<IdeogramGenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Ideogram API error: ${response.status} - ${errorData.error || response.statusText}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Ideogram generate error:', error)
      throw error
    }
  }

  /**
   * Remix/edit existing image
   */
  async remix(request: IdeogramRemixRequest): Promise<IdeogramGenerateResponse> {
    try {
      const formData = new FormData()
      
      // Add image request as JSON
      formData.append('image_request', JSON.stringify({
        prompt: request.image_request.prompt,
        aspect_ratio: request.image_request.aspect_ratio,
        model: request.image_request.model,
        magic_prompt_option: request.image_request.magic_prompt_option,
        style_type: request.image_request.style_type,
      }))

      // Add image file or URL
      if (request.image_request.image_file) {
        formData.append('image_file', request.image_request.image_file)
      } else if (request.image_request.image_url) {
        // For URL, we need to download and convert to blob
        const imageResponse = await fetch(request.image_request.image_url)
        const imageBlob = await imageResponse.blob()
        formData.append('image_file', imageBlob)
      }

      const response = await fetch(`${this.baseUrl}/remix`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Ideogram API error: ${response.status} - ${errorData.error || response.statusText}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Ideogram remix error:', error)
      throw error
    }
  }

  /**
   * Helper: Generate wedding moodboard collage
   */
  async generateWeddingMoodboard(
    prompt: string,
    options?: {
      aspectRatio?: IdeogramGenerateRequest['image_request']['aspect_ratio']
      style?: IdeogramGenerateRequest['image_request']['style_type']
      seed?: number
    }
  ): Promise<string> {
    const request: IdeogramGenerateRequest = {
      image_request: {
        prompt,
        aspect_ratio: options?.aspectRatio || 'ASPECT_16_9',
        model: 'V_2',
        magic_prompt_option: 'ON',
        style_type: options?.style || 'DESIGN',
        seed: options?.seed,
      },
    }

    const response = await this.generate(request)
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated')
    }

    return response.data[0].url
  }
}

/**
 * Server-side only: Get Ideogram client instance
 */
export function getIdeogramClient(): IdeogramClient {
  const apiKey = process.env.IDEOGRAM_API_KEY
  
  if (!apiKey) {
    throw new Error('IDEOGRAM_API_KEY environment variable is not set')
  }

  return new IdeogramClient(apiKey)
}

