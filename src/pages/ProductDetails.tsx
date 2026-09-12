import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import {
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
} from "@/services/productApi";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { addToCart, increaseQuantity, decreaseQuantity } from "@/app/cartSlice";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ArrowLeft, Star, ShoppingCart } from "lucide-react";
import StarRating from "@/components/atoms/StarRating";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import Badge from "@/components/atoms/Badge";
import ProductGrid from "@/components/organisms/ProductGrid";

function ProductDetails() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProductByIdQuery(Number(id));
  const dispatch = useDispatch();
  const [myRating, setMyRating] = useState(0);

  useEffect(() => {
    if (product) {
      setMyRating(Math.round(product.rating));
    }
  }, [product]);

  const { data: similarData } = useGetProductsByCategoryQuery(
    product?.category ?? "",
    { skip: !product }
  );

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((item) => item.productId === Number(id))
  );

  if (isLoading) return <p>Loading product...</p>;
  if (error)
    return <ErrorMessage message="Something went wrong while fetching this product." />;
  if (!product) return <p>Product not found.</p>;

  const hasDiscount = product.discountPercentage > 1;
  const originalPrice = hasDiscount
    ? product.price / (1 - product.discountPercentage / 100)
    : null;

  const similarProducts = similarData?.products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    dispatch(addToCart(product.id));
    toast("Added to cart", { description: product.title });
  };

  return (
    <div>
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1" /> Back to products
        </Button>
      </Link>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <div className="relative rounded-xl overflow-hidden bg-muted h-full min-h-[280px]">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1">
              -{Math.round(product.discountPercentage)}% off
            </span>
          )}
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-medium">
            <Star className="fill-yellow-400 text-yellow-400" size={12} />
            {product.rating.toFixed(1)} rating
          </span>
        </div>

        <div className="border rounded-xl p-5 flex flex-col h-full justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge>{product.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {product.stock} in stock
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight">{product.title}</h1>

          <p className="text-muted-foreground text-sm">{product.description}</p>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-4xl font-extrabold text-primary">
              ${product.price}
            </span>
            {hasDiscount && originalPrice && (
              <span className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <StarRating value={myRating} onChange={setMyRating} size={24} />
              <span className="text-sm text-muted-foreground">
                {myRating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to rate this product
            </p>
          </div>

          <div>
            {cartItem ? (
              <div className="flex items-center gap-3 rounded-full border w-fit px-1 py-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => dispatch(decreaseQuantity(product.id))}
                >
                  <Minus size={16} />
                </Button>
                <span className="text-lg font-medium w-8 text-center">
                  {cartItem.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => dispatch(increaseQuantity(product.id))}
                >
                  <Plus size={16} />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full rounded-full"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2" size={18} /> Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      {similarProducts && similarProducts.length > 0 && (
        <div className="mt-10">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            You may also like
          </p>
          <h2 className="text-xl font-semibold mt-1 mb-4">Similar products</h2>
          <ProductGrid products={similarProducts} />
        </div>
      )}
    </div>
  );
}

export default ProductDetails;