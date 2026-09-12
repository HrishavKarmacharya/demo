import { Card, CardContent } from "@/components/ui/card";
import LoadingSkeleton from "@/components/atoms/LoadingSkeleton";

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <LoadingSkeleton variant="block" className="h-40 rounded-none" />
      <CardContent className="p-4 space-y-2">
        <LoadingSkeleton variant="text" className="w-3/4" />
        <LoadingSkeleton variant="text" className="h-5 w-1/3" />
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" className="h-5 w-16 rounded-full" />
          <LoadingSkeleton variant="text" className="h-4 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCardSkeleton;