import React from 'react';
import AuroraBackground from '@/components/ui/AuroraBackground';

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={`bg-black/20 p-6 rounded-3xl border border-white/10 animate-pulse shadow-inner-soft ${className}`}>
    <div className="h-10 w-10 bg-white/10 rounded-2xl mb-6"></div>
    <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-3"></div>
    <div className="h-4 w-1/2 bg-white/10 rounded-lg"></div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#0A0A0A] text-gray-300 relative overflow-hidden p-6">
    <AuroraBackground />
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8 h-20">
        <div className="h-16 w-48 bg-white/[.04] rounded-2xl animate-pulse"></div>
        <div className="flex items-center gap-4">
          <div className="h-16 w-64 bg-white/[.04] rounded-2xl animate-pulse"></div>
          <div className="h-14 w-14 bg-white/[.04] rounded-2xl animate-pulse"></div>
        </div>
      </div>
      {/* Title Skeleton */}
      <div className="mb-12">
        <div className="h-6 w-1/4 bg-black/20 rounded animate-pulse mb-4"></div>
        <div className="h-16 w-1/2 bg-black/20 rounded-lg animate-pulse mb-4"></div>
        <div className="h-5 w-1/3 bg-black/20 rounded animate-pulse"></div>
      </div>
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 animate-pulse">
          <div className="h-8 w-1/3 bg-white/10 rounded mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-12 flex-1 bg-white/10 rounded-xl"></div>
            <div className="h-12 w-32 bg-white/10 rounded-xl"></div>
            <div className="h-12 w-32 bg-white/10 rounded-xl"></div>
          </div>
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/10 rounded-2xl"></div>)}
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 animate-pulse">
          <div className="h-8 w-1/2 bg-white/10 rounded mb-8"></div>
          <div className="space-y-6">
            <div className="h-20 bg-white/10 rounded-xl"></div>
            <div className="h-20 bg-white/10 rounded-xl"></div>
            <div className="h-32 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;