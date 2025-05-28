import * as functions from 'firebase-functions'
import { collections, serverTimestamp } from '../config/firebase'
import { validateAuth } from '../config/firebase'
import { Vendor, VendorCategory } from '../types'
import slugify from 'slugify'

interface CreateVendorData {
  name: string
  category: VendorCategory
  description: string
  shortDescription: string
  businessName: string
  businessId?: string
  website?: string
  email: string
  phone: string
  workingRadius?: number
  address: {
    street?: string
    city: string
    postalCode?: string
    region?: string
    country?: string
  }
  priceRange?: {
    min: number
    max: number
    currency: string
    unit: string
  }
  features?: string[]
  specialties?: string[]
}

// Callable function to create a vendor
const createVendor = functions.https.onCall(async (data: CreateVendorData, context) => {
  try {
    // Validate authentication
    const auth = validateAuth(context)

    // Validate required fields
    if (!data.name || !data.category || !data.description || !data.email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      )
    }

    // Validate category
    if (!Object.values(VendorCategory).includes(data.category)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid vendor category'
      )
    }

    // Check if user already has a vendor profile
    const existingVendorSnapshot = await collections.vendors
      .where('userId', '==', auth.uid)
      .get()

    if (!existingVendorSnapshot.empty) {
      throw new functions.https.HttpsError(
        'already-exists',
        'User already has a vendor profile'
      )
    }

    // Generate unique slug
    let slug = slugify(data.name, { lower: true, strict: true })
    let slugExists = true
    let counter = 1

    while (slugExists) {
      const slugQuery = await collections.vendors.where('slug', '==', slug).get()
      if (slugQuery.empty) {
        slugExists = false
      } else {
        slug = `${slugify(data.name, { lower: true, strict: true })}-${counter}`
        counter++
      }
    }

    // Prepare vendor data
    const vendorData: Omit<Vendor, 'id'> = {
      userId: auth.uid,
      name: data.name,
      slug,
      category: data.category,
      description: data.description,
      shortDescription: data.shortDescription,
      businessName: data.businessName,
      businessId: data.businessId || null,
      website: data.website || null,
      email: data.email,
      phone: data.phone,
      workingRadius: data.workingRadius || 50,
      verified: auth.token?.role === 'admin' || auth.token?.role === 'super_admin',
      featured: false,
      premium: false,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      address: {
        street: data.address.street || '',
        city: data.address.city,
        postalCode: data.address.postalCode || '',
        region: data.address.region || '',
        country: data.address.country || 'Czech Republic'
      },
      priceRange: data.priceRange || null,
      images: [],
      portfolioImages: [],
      features: data.features || [],
      specialties: data.specialties || [],
      availability: {
        weekdays: [true, true, true, true, true, true, true],
        timeSlots: [],
        blackoutDates: [],
        advanceBooking: 30
      },
      rating: {
        overall: 0,
        count: 0,
        breakdown: {
          quality: 0,
          communication: 0,
          value: 0,
          professionalism: 0
        }
      },
      stats: {
        views: 0,
        inquiries: 0,
        bookings: 0,
        favorites: 0,
        responseRate: 0,
        responseTime: 0
      }
    }

    // Create vendor document
    const vendorRef = await collections.vendors.add(vendorData)

    // Send notification to user
    await collections.notifications.add({
      userId: auth.uid,
      type: 'vendor_verified',
      title: 'Dodavatelský profil vytvořen!',
      message: vendorData.verified 
        ? 'Váš profil byl vytvořen a ověřen. Je nyní viditelný pro zákazníky.'
        : 'Váš profil byl vytvořen a čeká na ověření administrátorem.',
      data: {
        vendorId: vendorRef.id,
        action: 'view_vendor_profile'
      },
      read: false,
      createdAt: serverTimestamp()
    })

    // Log activity
    console.log('Vendor created:', vendorRef.id, 'by user:', auth.uid)

    return {
      success: true,
      message: 'Vendor created successfully',
      data: {
        vendorId: vendorRef.id,
        vendor: {
          id: vendorRef.id,
          ...vendorData
        }
      }
    }
  } catch (error) {
    console.error('Create vendor error:', error)
    
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create vendor'
    )
  }
})

export default createVendor
