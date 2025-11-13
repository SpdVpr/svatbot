'use client'

import Image from 'next/image'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Skeleton - Match exact header style */}
      <header className="bg-gray-50/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm sticky top-0 z-[200]">
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="mobile-header">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <video
                src="/Animation-logo.webm"
                autoPlay
                muted
                playsInline
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <video
                src="/Animation-logo.webm"
                autoPlay
                muted
                playsInline
                className="h-20 w-auto"
              />
              <div className="border-l border-gray-300 pl-6">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 py-2 sm:py-6 px-2 sm:px-6 lg:px-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2000px]">
          {/* Dashboard Controls Skeleton */}
          <div className="bg-gray-50/95 backdrop-blur-xl p-5 rounded-3xl border border-gray-100/60 mx-auto shadow-lg mb-6" style={{ maxWidth: '1240px' }}>
            <div className="flex items-center justify-between">
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex items-center space-x-2">
                <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse" />
                <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Grid of module skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ maxWidth: '1240px', margin: '0 auto' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 h-[353px] animate-pulse shadow-sm"
              >
                {/* Module header */}
                <div className="mb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>

                {/* Module content */}
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

