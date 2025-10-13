'use client'

import { useState } from 'react'
import { Heart, Sparkles, Star, Gift, Music } from 'lucide-react'
import RippleButton from '@/components/ui/RippleButton'
import MagneticButton from '@/components/ui/MagneticButton'
import StaggerContainer from '@/components/ui/StaggerContainer'
import AdvancedLoader from '@/components/ui/AdvancedLoader'

export default function AnimationsDemo() {
  const [showConfetti, setShowConfetti] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 slide-in-bottom">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 wedding-text-gradient">
            🎨 Advanced Animations Demo
          </h1>
          <p className="text-xl text-gray-600">
            Micro Animations & Motion Design - 2025 Trends
          </p>
        </div>

        {/* Stagger Animations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">1. Stagger Animations</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="wedding-card p-6">
              <Heart className="w-12 h-12 text-primary-500 mb-4" fill="currentColor" />
              <h3 className="text-xl font-semibold mb-2">Card 1</h3>
              <p className="text-gray-600">Appears first</p>
            </div>
            <div className="wedding-card p-6">
              <Sparkles className="w-12 h-12 text-secondary-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Card 2</h3>
              <p className="text-gray-600">Appears second</p>
            </div>
            <div className="wedding-card p-6">
              <Star className="w-12 h-12 text-accent-500 mb-4" fill="currentColor" />
              <h3 className="text-xl font-semibold mb-2">Card 3</h3>
              <p className="text-gray-600">Appears third</p>
            </div>
          </StaggerContainer>
        </section>

        {/* Ripple Effect */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">2. Ripple Effect Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <RippleButton className="btn-primary">
              Click for Ripple Effect
            </RippleButton>
            <RippleButton className="btn-secondary" rippleColor="rgba(139, 92, 246, 0.4)">
              Secondary Ripple
            </RippleButton>
            <RippleButton className="btn-outline" rippleColor="rgba(248, 113, 113, 0.3)">
              Outline Ripple
            </RippleButton>
          </div>
        </section>

        {/* Magnetic Buttons */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">3. Magnetic Hover Effect</h2>
          <div className="flex flex-wrap gap-6">
            <MagneticButton className="wedding-card p-8 cursor-pointer">
              <Heart className="w-16 h-16 text-primary-500 mx-auto mb-2" fill="currentColor" />
              <p className="text-center font-semibold">Hover me!</p>
            </MagneticButton>
            <MagneticButton className="wedding-card p-8 cursor-pointer" strength={0.5}>
              <Sparkles className="w-16 h-16 text-secondary-500 mx-auto mb-2" />
              <p className="text-center font-semibold">Strong magnet</p>
            </MagneticButton>
          </div>
        </section>

        {/* Advanced Loaders */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">4. Advanced Loading States</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="wedding-card p-6 flex flex-col items-center">
              <AdvancedLoader type="hearts" size="md" />
              <p className="mt-4 text-sm text-gray-600">Hearts</p>
            </div>
            <div className="wedding-card p-6 flex flex-col items-center">
              <AdvancedLoader type="sparkles" size="md" color="text-secondary-500" />
              <p className="mt-4 text-sm text-gray-600">Sparkles</p>
            </div>
            <div className="wedding-card p-6 flex flex-col items-center">
              <AdvancedLoader type="pulse" size="md" color="text-accent-500" />
              <p className="mt-4 text-sm text-gray-600">Pulse</p>
            </div>
            <div className="wedding-card p-6 flex flex-col items-center">
              <AdvancedLoader type="dots" size="md" color="text-primary-500" />
              <p className="mt-4 text-sm text-gray-600">Dots</p>
            </div>
            <div className="wedding-card p-6 flex flex-col items-center">
              <AdvancedLoader type="rings" size="md" color="text-secondary-500" />
              <p className="mt-4 text-sm text-gray-600">Rings</p>
            </div>
          </div>
        </section>

        {/* Float & Rotate */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">5. Float & Rotate Animations</h2>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="text-center">
              <Heart className="w-16 h-16 text-primary-500 float mx-auto mb-2" fill="currentColor" />
              <p className="text-sm text-gray-600">Float</p>
            </div>
            <div className="text-center">
              <Gift className="w-16 h-16 text-secondary-500 float-rotate mx-auto mb-2" />
              <p className="text-sm text-gray-600">Float + Rotate</p>
            </div>
            <div className="text-center">
              <Music className="w-16 h-16 text-accent-500 heartbeat mx-auto mb-2" />
              <p className="text-sm text-gray-600">Heartbeat</p>
            </div>
          </div>
        </section>

        {/* Slide Animations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">6. Slide Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="wedding-card p-6 slide-in-left">
              <h3 className="text-xl font-semibold mb-2">← Slide Left</h3>
              <p className="text-gray-600">Enters from left</p>
            </div>
            <div className="wedding-card p-6 slide-in-bottom">
              <h3 className="text-xl font-semibold mb-2">↑ Slide Bottom</h3>
              <p className="text-gray-600">Enters from bottom</p>
            </div>
            <div className="wedding-card p-6 slide-in-right">
              <h3 className="text-xl font-semibold mb-2">Slide Right →</h3>
              <p className="text-gray-600">Enters from right</p>
            </div>
          </div>
        </section>

        {/* Bounce & Scale */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">7. Bounce & Scale Effects</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <button className="wedding-card p-8 hover:animate-bounce-in cursor-pointer">
              <Star className="w-12 h-12 text-primary-500 mx-auto" fill="currentColor" />
              <p className="mt-2 text-sm">Bounce In</p>
            </button>
            <button className="wedding-card p-8 hover:animate-elastic-bounce cursor-pointer">
              <Heart className="w-12 h-12 text-secondary-500 mx-auto" fill="currentColor" />
              <p className="mt-2 text-sm">Elastic</p>
            </button>
            <button className="wedding-card p-8 hover:animate-scale-in cursor-pointer">
              <Sparkles className="w-12 h-12 text-accent-500 mx-auto" />
              <p className="mt-2 text-sm">Scale In</p>
            </button>
          </div>
        </section>

        {/* Shimmer Effect */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">8. Shimmer & Glow Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="wedding-card p-8 shimmer bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100">
              <h3 className="text-xl font-semibold mb-2">Shimmer Effect</h3>
              <p className="text-gray-600">Subtle shine animation</p>
            </div>
            <div className="wedding-card p-8">
              <Heart className="w-16 h-16 text-primary-500 pulse-glow mx-auto mb-4" fill="currentColor" />
              <h3 className="text-xl font-semibold mb-2 text-center">Pulse Glow</h3>
              <p className="text-gray-600 text-center">Glowing pulse effect</p>
            </div>
          </div>
        </section>

        {/* Gradient Animation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">9. Animated Gradients</h2>
          <div className="wedding-card p-12 gradient-animate bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Animated Gradient Background</h3>
            <p>Smooth color transitions</p>
          </div>
        </section>

        {/* Wave Animation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">10. Wave Animation</h2>
          <div className="wedding-card p-12 flex justify-center items-center space-x-2">
            <div className="w-4 h-16 bg-primary-500 rounded-full wave"></div>
            <div className="w-4 h-16 bg-secondary-500 rounded-full wave"></div>
            <div className="w-4 h-16 bg-accent-500 rounded-full wave"></div>
            <div className="w-4 h-16 bg-primary-500 rounded-full wave"></div>
            <div className="w-4 h-16 bg-secondary-500 rounded-full wave"></div>
          </div>
        </section>

        {/* Back Button */}
        <div className="text-center mt-16">
          <a href="/" className="btn-primary inline-block">
            ← Zpět na Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

