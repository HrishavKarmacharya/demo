import { Link } from "react-router";
import { Heart, ShoppingCart, Plus, Minus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Badge from "@/components/atoms/Badge";
import type { Product } from "@/types/product";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { toggleWishlist } from "@/app/wishlistSlice";
import { addToCart, increaseQuantity, decreaseQuantity } from "@/app/cartSlice";
import { calculateOriginalPrice } from "@/utils/pricing";

interface ProductListItemProps {
  product: Product;
}

function ProductListItem({ product }: ProductListItemProps) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.productIds.includes(product.id)
  );
  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((item) => item.productId === product.id)
  );

  const originalPrice = calculateOriginalPrice(product.price, product.discountPercentage);
  const hasDiscount = originalPrice !== null;

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product.id));
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: product.title,
    });
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.id, stock: product.stock }));
    toast("Added to cart", { description: product.title });
  };

  return (
    <div className="flex items-center gap-4 p-3 border-b last:border-b-0">
      <Link to={`/products/${product.id}`} className="shrink-0">
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge>{product.category}</Badge>
          <span className="text-xs text-muted-foreground">
            {product.stock} left
          </span>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm leading-snug line-clamp-1 mt-1">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 shrink-0 w-24">
        <span className="text-lg font-semibold text-primary">
          ${product.price}
        </span>
        {hasDiscount && originalPrice && (
          <span className="text-xs text-muted-foreground line-through">
            ${originalPrice.toFixed(2)}
          </span>
        )}
      </div>

      <button
        onClick={handleWishlistToggle}
        aria-label="Toggle wishlist"
        className="text-muted-foreground hover:text-primary shrink-0"
      >
        <Heart size={18} className={isWishlisted ? "fill-primary text-primary" : ""} />
      </button>

      <div className="shrink-0">
        {cartItem ? (
          <div className="flex items-center gap-2 rounded-full border px-1 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              aria-label="Decrease quantity"
              onClick={() => dispatch(decreaseQuantity(product.id))}
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
              aria-label="Increase quantity"
              disabled={cartItem.quantity >= product.stock}
              onClick={() =>
                dispatch(increaseQuantity({ productId: product.id, stock: product.stock }))
              }
            >
              <Plus size={14} />
            </Button>
          </div>
        ) : (
          <Button size="sm" className="rounded-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-1" size={14} /> Add
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductListItem;