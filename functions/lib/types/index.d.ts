import { Timestamp, FieldValue } from 'firebase-admin/firestore';
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    verified: boolean;
    active: boolean;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    lastLoginAt?: Timestamp | FieldValue;
    profileImage?: string;
    preferences?: UserPreferences;
}
export declare enum UserRole {
    USER = "user",
    VENDOR = "vendor",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    language: string;
    currency: string;
}
export interface Vendor {
    id: string;
    userId: string;
    name: string;
    slug: string;
    category: VendorCategory;
    description: string;
    shortDescription: string;
    businessName: string;
    businessId?: string;
    website?: string;
    email: string;
    phone: string;
    workingRadius: number;
    verified: boolean;
    featured: boolean;
    premium: boolean;
    active: boolean;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    address: Address;
    priceRange: PriceRange;
    images: VendorImage[];
    portfolioImages: PortfolioImage[];
    features: string[];
    specialties: string[];
    availability: Availability;
    socialMedia?: SocialMedia;
    rating?: VendorRating;
    stats?: VendorStats;
}
export declare enum VendorCategory {
    PHOTOGRAPHER = "photographer",
    VIDEOGRAPHER = "videographer",
    VENUE = "venue",
    CATERING = "catering",
    FLOWERS = "flowers",
    MUSIC = "music",
    DECORATION = "decoration",
    DRESS = "dress",
    SUIT = "suit",
    MAKEUP = "makeup",
    HAIR = "hair",
    TRANSPORT = "transport",
    CAKE = "cake",
    JEWELRY = "jewelry",
    INVITATIONS = "invitations",
    OTHER = "other"
}
export interface Address {
    street?: string;
    city: string;
    postalCode?: string;
    region?: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export interface PriceRange {
    min: number;
    max: number;
    currency: string;
    unit: PriceUnit;
}
export declare enum PriceUnit {
    PER_EVENT = "per_event",
    PER_PERSON = "per_person",
    PER_HOUR = "per_hour",
    PER_DAY = "per_day",
    PACKAGE = "package"
}
export interface VendorImage {
    id: string;
    url: string;
    alt: string;
    sortOrder: number;
    isMain?: boolean;
}
export interface PortfolioImage {
    id: string;
    url: string;
    alt: string;
    sortOrder: number;
    category?: string;
}
export interface Availability {
    weekdays: boolean[];
    timeSlots: TimeSlot[];
    blackoutDates: Date[];
    advanceBooking: number;
}
export interface TimeSlot {
    start: string;
    end: string;
}
export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
}
export interface VendorRating {
    overall: number;
    count: number;
    breakdown: {
        quality: number;
        communication: number;
        value: number;
        professionalism: number;
    };
}
export interface VendorStats {
    views: number;
    inquiries: number;
    bookings: number;
    favorites: number;
    responseRate: number;
    responseTime: number;
}
export interface Service {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price?: number;
    priceType: ServicePriceType;
    duration?: string;
    includes: string[];
    popular: boolean;
    active: boolean;
    sortOrder: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export declare enum ServicePriceType {
    FIXED = "fixed",
    PER_PERSON = "per_person",
    PER_HOUR = "per_hour",
    PER_DAY = "per_day",
    PACKAGE = "package",
    CUSTOM = "custom"
}
export interface Review {
    id: string;
    vendorId: string;
    userId: string;
    rating: number;
    title?: string;
    text: string;
    quality: number;
    communication: number;
    value: number;
    professionalism: number;
    weddingDate?: Timestamp;
    verified: boolean;
    helpful: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    response?: VendorResponse;
}
export interface VendorResponse {
    text: string;
    createdAt: Timestamp;
}
export interface Inquiry {
    id: string;
    vendorId: string;
    userId?: string;
    name: string;
    email: string;
    phone?: string;
    weddingDate?: Timestamp;
    guestCount?: number;
    budget?: number;
    message: string;
    status: InquiryStatus;
    priority: InquiryPriority;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    responses: InquiryResponse[];
    metadata?: InquiryMetadata;
}
export declare enum InquiryStatus {
    NEW = "new",
    VIEWED = "viewed",
    RESPONDED = "responded",
    QUOTED = "quoted",
    BOOKED = "booked",
    DECLINED = "declined",
    EXPIRED = "expired"
}
export declare enum InquiryPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent"
}
export interface InquiryResponse {
    id: string;
    fromVendor: boolean;
    message: string;
    attachments?: string[];
    createdAt: Timestamp;
}
export interface InquiryMetadata {
    source: string;
    ip?: string;
    userAgent?: string;
    referrer?: string;
}
export interface Favorite {
    id: string;
    userId: string;
    vendorId: string;
    createdAt: Timestamp;
}
export interface VendorAnalytics {
    id: string;
    vendorId: string;
    date: Timestamp;
    views: number;
    inquiries: number;
    favorites: number;
    profileClicks: number;
    phoneClicks: number;
    emailClicks: number;
    websiteClicks: number;
}
export interface SystemAnalytics {
    id: string;
    date: Timestamp;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalVendors: number;
    activeVendors: number;
    newVendors: number;
    totalInquiries: number;
    totalReviews: number;
}
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: Timestamp;
}
export declare enum NotificationType {
    INQUIRY_RECEIVED = "inquiry_received",
    INQUIRY_RESPONSE = "inquiry_response",
    REVIEW_RECEIVED = "review_received",
    VENDOR_VERIFIED = "vendor_verified",
    VENDOR_FEATURED = "vendor_featured",
    SYSTEM_UPDATE = "system_update",
    PROMOTION = "promotion"
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface VendorFilters {
    category?: VendorCategory;
    city?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    verified?: boolean;
    featured?: boolean;
    search?: string;
    sortBy?: VendorSortBy;
    sortOrder?: 'asc' | 'desc';
}
export declare enum VendorSortBy {
    NAME = "name",
    CREATED_AT = "createdAt",
    RATING = "rating",
    PRICE = "price",
    POPULARITY = "popularity"
}
export interface UploadResult {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
    path: string;
}
export interface EmailTemplate {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: EmailAttachment[];
}
export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
}
export interface AdminStats {
    users: {
        total: number;
        active: number;
        verified: number;
        new: number;
    };
    vendors: {
        total: number;
        active: number;
        verified: number;
        featured: number;
        pending: number;
    };
    inquiries: {
        total: number;
        today: number;
        pending: number;
    };
    reviews: {
        total: number;
        average: number;
    };
}
export interface ApiError {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
}
//# sourceMappingURL=index.d.ts.map