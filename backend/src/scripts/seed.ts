import { PrismaClient, UserRole, VendorCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { logger } from '../config/logger'

const prisma = new PrismaClient()

async function main() {
  logger.info('🌱 Starting database seeding...')

  try {
    // Create admin users
    const adminPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@svatbot.cz' },
      update: {},
      create: {
        email: 'admin@svatbot.cz',
        password: adminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        verified: true,
        active: true
      }
    })

    const admin = await prisma.user.upsert({
      where: { email: 'moderator@svatbot.cz' },
      update: {},
      create: {
        email: 'moderator@svatbot.cz',
        password: adminPassword,
        firstName: 'Moderator',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        verified: true,
        active: true
      }
    })

    logger.info('✅ Admin users created')

    // Create sample vendors
    const vendors = [
      {
        name: 'Photo Nejedlí',
        category: VendorCategory.PHOTOGRAPHER,
        description: 'Profesionální svatební fotografie s důrazem na přirozené okamžiky a emoce. Specializujeme se na reportážní styl a kreativní portréty.',
        shortDescription: 'Profesionální svatební fotografie s důrazem na přirozené okamžiky',
        businessName: 'Photo Nejedlí s.r.o.',
        businessId: '12345678',
        website: 'https://photonejedli.cz',
        email: 'info@photonejedli.cz',
        phone: '+420777123456',
        workingRadius: 100,
        verified: true,
        featured: true,
        premium: true,
        address: {
          street: 'Václavské náměstí 1',
          city: 'Praha',
          postalCode: '110 00',
          region: 'Praha',
          country: 'Czech Republic'
        },
        priceRange: {
          min: 15000,
          max: 50000,
          currency: 'CZK',
          unit: 'per-event'
        },
        features: ['Reportážní fotografie', 'Kreativní portréty', 'Digitální galerie', 'Retušování'],
        specialties: ['Venkovní svatby', 'Intimní ceremonie', 'Destination weddings'],
        services: [
          {
            name: 'Základní balíček',
            description: 'Celý svatební den, 300+ retušovaných fotografií',
            price: 25000,
            priceType: 'FIXED',
            duration: '8 hodin',
            includes: ['Přípravy nevěsty', 'Obřad', 'Oslava', 'Online galerie', 'USB s fotkami']
          },
          {
            name: 'Premium balíček',
            description: 'Rozšířený balíček s předsvatebním focením',
            price: 40000,
            priceType: 'FIXED',
            duration: '10 hodin',
            includes: ['Předsvatební focení', 'Celý svatební den', '500+ fotografií', 'Fotoalbum', 'Online galerie']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'
        ],
        portfolioImages: [
          'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
          'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800',
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'
        ]
      },
      {
        name: 'Château Mcely',
        category: VendorCategory.VENUE,
        description: 'Luxusní château hotel pro nezapomenutelné svatby v romantickém prostředí. Nabízíme kompletní služby pro váš velký den.',
        shortDescription: 'Luxusní château hotel pro nezapomenutelné svatby',
        businessName: 'Château Mcely a.s.',
        businessId: '87654321',
        website: 'https://chateaumcely.cz',
        email: 'svatby@chateaumcely.cz',
        phone: '+420777654321',
        workingRadius: 50,
        verified: true,
        featured: true,
        address: {
          street: 'Mcely 61',
          city: 'Mcely',
          postalCode: '289 34',
          region: 'Středočeský kraj',
          country: 'Czech Republic'
        },
        priceRange: {
          min: 80000,
          max: 300000,
          currency: 'CZK',
          unit: 'per-event'
        },
        features: ['Historické prostředí', 'Wellness centrum', 'Ubytování hostů', 'Catering'],
        specialties: ['Luxusní svatby', 'Víkendové oslavy', 'Mezinárodní svatby'],
        services: [
          {
            name: 'Svatební obřad',
            description: 'Ceremonie v krásném prostředí château',
            price: 50000,
            priceType: 'FIXED',
            duration: '2 hodiny',
            includes: ['Svatební síň', 'Dekorace', 'Koordinátor', 'Hudba']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f29c7c8756?w=800',
          'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800'
        ],
        portfolioImages: [
          'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
          'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800'
        ]
      },
      {
        name: 'Květiny Růža',
        category: VendorCategory.FLOWERS,
        description: 'Kreativní květinové aranžmá pro svatby. Specializujeme se na přírodní a rustikální styl s důrazem na sezónní květiny.',
        shortDescription: 'Kreativní květinové aranžmá pro svatby',
        businessName: 'Květiny Růža s.r.o.',
        businessId: '11223344',
        website: 'https://kvetinyruza.cz',
        email: 'info@kvetinyruza.cz',
        phone: '+420777111222',
        workingRadius: 80,
        verified: true,
        address: {
          street: 'Národní 15',
          city: 'Brno',
          postalCode: '602 00',
          region: 'Jihomoravský kraj',
          country: 'Czech Republic'
        },
        priceRange: {
          min: 8000,
          max: 25000,
          currency: 'CZK',
          unit: 'per-event'
        },
        features: ['Svatební kytice', 'Dekorace obřadu', 'Stolní aranžmá', 'Květinové brány'],
        specialties: ['Rustikální styl', 'Boho svatby', 'Sezónní květiny'],
        services: [
          {
            name: 'Svatební kytice',
            description: 'Krásná kytice podle vašich přání',
            price: 3500,
            priceType: 'FIXED',
            includes: ['Konzultace', 'Kytice nevěsty', 'Korsáž ženicha']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'
        ],
        portfolioImages: [
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'
        ]
      }
    ]

    // Create vendor users and vendors
    for (const vendorData of vendors) {
      const vendorUser = await prisma.user.create({
        data: {
          email: vendorData.email,
          password: adminPassword,
          firstName: vendorData.name.split(' ')[0],
          lastName: vendorData.name.split(' ').slice(1).join(' '),
          role: UserRole.VENDOR,
          verified: true,
          active: true
        }
      })

      const vendor = await prisma.vendor.create({
        data: {
          userId: vendorUser.id,
          name: vendorData.name,
          slug: vendorData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          category: vendorData.category,
          description: vendorData.description,
          shortDescription: vendorData.shortDescription,
          businessName: vendorData.businessName,
          businessId: vendorData.businessId,
          website: vendorData.website,
          email: vendorData.email,
          phone: vendorData.phone,
          workingRadius: vendorData.workingRadius,
          verified: vendorData.verified,
          featured: vendorData.featured || false,
          premium: vendorData.premium || false
        }
      })

      // Create address
      await prisma.address.create({
        data: {
          vendorId: vendor.id,
          ...vendorData.address
        }
      })

      // Create price range
      await prisma.priceRange.create({
        data: {
          vendorId: vendor.id,
          ...vendorData.priceRange
        }
      })

      // Create features
      for (const feature of vendorData.features) {
        await prisma.feature.create({
          data: {
            vendorId: vendor.id,
            name: feature
          }
        })
      }

      // Create specialties
      for (const specialty of vendorData.specialties) {
        await prisma.specialty.create({
          data: {
            vendorId: vendor.id,
            name: specialty
          }
        })
      }

      // Create services
      for (const serviceData of vendorData.services) {
        const service = await prisma.service.create({
          data: {
            vendorId: vendor.id,
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            priceType: serviceData.priceType as any,
            duration: serviceData.duration
          }
        })

        // Create service includes
        if (serviceData.includes) {
          for (let i = 0; i < serviceData.includes.length; i++) {
            await prisma.serviceInclude.create({
              data: {
                serviceId: service.id,
                item: serviceData.includes[i],
                sortOrder: i
              }
            })
          }
        }
      }

      // Create images
      for (let i = 0; i < vendorData.images.length; i++) {
        await prisma.vendorImage.create({
          data: {
            vendorId: vendor.id,
            url: vendorData.images[i],
            alt: `${vendorData.name} - Obrázek ${i + 1}`,
            sortOrder: i
          }
        })
      }

      // Create portfolio images
      for (let i = 0; i < vendorData.portfolioImages.length; i++) {
        await prisma.portfolioImage.create({
          data: {
            vendorId: vendor.id,
            url: vendorData.portfolioImages[i],
            alt: `${vendorData.name} - Portfolio ${i + 1}`,
            sortOrder: i
          }
        })
      }

      logger.info(`✅ Created vendor: ${vendorData.name}`)
    }

    logger.info('🎉 Database seeding completed successfully!')
  } catch (error) {
    logger.error('❌ Database seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
