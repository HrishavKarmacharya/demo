import { Link } from "react-router";
import { Heart, ShoppingCart, Plus, Minus, Star } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Badge from "@/components/atoms/Badge";
import StarRating from "@/components/atoms/StarRating";
import type { Product } from "@/types/product";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { toggleWishlist } from "@/app/wishlistSlice";
import { addToCart, increaseQuantity, decreaseQuantity } from "@/app/cartSlice";
import { calculateOriginalPrice } from "@/utils/pricing";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.productIds.includes(product.id)
  );
  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((item) => item.productId === product.id)
  );

const originalPrice = calculateOriginalPrice(product.price, product.discountPercentage);
const hasDiscount = originalPrice !== null;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleWishlist(product.id));
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: product.title,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product.id, stock: product.stock }))
    toast("Added to cart", { description: product.title });
  };

  return (
    <Card className="relative overflow-hidden rounded-xl border-border/60 p-0 gap-0 transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}

        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-xs font-medium">
          <Star className="fill-yellow-400 text-yellow-400" size={12} />
          {product.rating.toFixed(1)}
        </span>
      </Link>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur"
        onClick={handleWishlistToggle}
      >
        <Heart className={isWishlisted ? "fill-primary text-primary" : ""} />
      </Button>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <Badge>{product.category}</Badge>
          <span className="text-xs text-muted-foreground">
            {product.stock} left
          </span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-base leading-snug line-clamp-2 min-h-[2.75rem] mt-2">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <StarRating value={Math.round(product.rating)} readOnly size={14} />
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-2xl font-semibold text-primary">
            ${product.price}
          </span>
          {hasDiscount && originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-3">
          {cartItem ? (
            <div className="flex items-center justify-center gap-3 rounded-full border w-fit mx-auto px-1 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(decreaseQuantity(product.id));
                }}
              >
                <Minus size={14} />
              </Button>
              <span className="font-medium w-4 text-center text-sm">
                {cartItem.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(increaseQuantity({ productId: product.id, stock: product.stock }))
                }}
              >
                <Plus size={14} />
              </Button>
            </div>
          ) : (
            <Button className="w-full rounded-full" size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="mr-1" /> Add to Cart
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ProductCard;