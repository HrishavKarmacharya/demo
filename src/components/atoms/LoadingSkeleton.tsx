import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant?: "text" | "circle" | "block";
  className?: string;
}

function LoadingSkeleton({ variant = "text", className = "" }: LoadingSkeletonProps) {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circle: "h-10 w-10 rounded-full",
    block: "h-32 w-full rounded-lg",
  };

  return <Skeleton className={`${variantStyles[variant]} ${className}`} />;
}

export default LoadingSkeleton;