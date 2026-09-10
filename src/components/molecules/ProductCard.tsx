import { Link } from "react-router";
import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Badge from "@/components/atoms/Badge";
import type { Product } from "@/types/product";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { toggleWishlist } from "@/app/wishlistSlice";
import { addToCart, increaseQuantity, decreaseQuantity } from "@/app/cartSlice";

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

  return (
    <Card className="overflow-hidden relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={(e) => {
          e.preventDefault();
          dispatch(toggleWishlist(product.id));
        }}
      >
        <Heart className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
      </Button>

      <Link to={`/products/${product.id}`}>
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
      </Link>

      <div className="px-4 pb-4">
        {cartItem ? (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                dispatch(decreaseQuantity(product.id));
              }}
            >
              <Minus />
            </Button>
            <span className="font-medium w-6 text-center">{cartItem.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                dispatch(increaseQuantity(product.id));
              }}
            >
              <Plus />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              dispatch(addToCart(product.id));
            }}
          >
            <ShoppingCart className="mr-1" /> Add to Cart
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ProductCard;