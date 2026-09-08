import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import Badge from "@/components/atoms/Badge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-40 w-full object-cover"
        />
        <CardContent className="p-4">
          <h3 className="font-medium text-sm truncate">{product.title}</h3>
          <p className="text-lg font-semibold mt-1">${product.price}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge>{product.category}</Badge>
            <span className="text-sm text-muted-foreground">
              ⭐ {product.rating}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link> // <a> tag would trigger a full browser page reload — defeating the entire point of a React SPA. Link intercepts the click and lets React Router swap the page content instantly, client-side, without reloading
  );
}

export default ProductCard;