// Review Types for Vendor Reviews

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface VendorReview {
  id: string
  vendorId: string
  userId: string
  userName: string
  userEmail: string
  
  // Review content
  rating: number // 1-5 overall rating
  title?: string
  text: string
  
  // Detailed ratings
  ratings: {
    quality: number // 1-5
    communication: number // 1-5
    value: number // 1-5
    professionalism: number // 1-5
  }
  
  // Photos (optional)
  images?: string[]
  
  // Wedding context
  weddingDate?: Date
  serviceUsed?: string
  
  // Moderation
  status: ReviewStatus
  moderatedBy?: string // admin user ID
  moderatedAt?: Date
  moderationNote?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  
  // Vendor response (optional)
  response?: {
    text: string
    createdAt: Date
  }
}

export interface CreateReviewData {
  vendorId: string
  rating: number
  title?: string
  text: string
  ratings: {
    quality: number
    communication: number
    value: number
    professionalism: number
  }
  images?: string[]
  weddingDate?: Date
  serviceUsed?: string
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  averageRatings: {
    quality: number
    communication: number
    value: number
    professionalism: number
  }
}

export interface ReviewFilters {
  vendorId?: string
  userId?: string
  status?: ReviewStatus
  minRating?: number
  maxRating?: number
}