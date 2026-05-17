interface SkeletonProps {
  className?: string;
}

export const LoadingSkeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`skeleton rounded ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <LoadingSkeleton className="aspect-[3/4] rounded-none" />
    <div className="p-3 space-y-2">
      <LoadingSkeleton className="h-3 w-16" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-5 w-20" />
    </div>
  </div>
);
