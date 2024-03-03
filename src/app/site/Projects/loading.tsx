import React from 'react';

// Skeleton components for loading states
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse ${className} bg-gray-300 rounded-md`}></div>
);

export default function Loading() {
    return (
    <div className="flex h-[90vh] mx-4">
      {/* Left Pane - Dummy Song Cards Skeleton */}
      <div className="flex-1 w-3/5 p-2">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      </div>

      {/* Right Pane - Details Skeleton */}
      <div className="w-2/5 ml-4 p-4">
        <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title */}
        <Skeleton className="h-6 w-5/6 mb-2" /> {/* Genre */}
        <Skeleton className="h-6 w-5/6 mb-2" /> {/* Instruments */}
        <Skeleton className="h-24 w-full mb-4" /> {/* Description */}
        <Skeleton className="h-12 w-1/2" /> {/* Music Player Placeholder */}
      </div>
    </div>
  );
};