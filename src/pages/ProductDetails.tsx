import { useParams, Link } from "react-router";
import { useGetProductByIdQuery } from "@/services/productApi";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { addToCart, increaseQuantity, decreaseQuantity } from "@/app/cartSlice";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ArrowLeft } from "lucide-react";

function ProductDetails() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProductByIdQuery(Number(id));
  const dispatch = useDispatch();

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((item) => item.productId === Number(id))
  );

  if (isLoading) return <p>Loading product...</p>;
  if (error) return <p>Something went wrong while fetching this product.</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1" /> Back
        </Button>
      </Link>

      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-full max-w-md rounded-lg"
      />
      <h1 className="text-2xl font-semibold mt-4">{product.title}</h1>
      <p className="text-muted-foreground mt-2">{product.description}</p>
      <p className="text-xl font-bold mt-4">${product.price}</p>
      <p className="mt-1">Category: {product.category}</p>
      <p className="mt-1">Rating: ⭐ {product.rating}</p>
      <p className="mt-1">
        {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
      </p>

      <div className="mt-4">
        {cartItem ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(decreaseQuantity(product.id))}
            >
              <Minus />
            </Button>
            <span className="text-lg font-medium w-8 text-center">
              {cartItem.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(increaseQuantity(product.id))}
            >
              <Plus />
            </Button>
          </div>
        ) : (
          <Button onClick={() => dispatch(addToCart(product.id))}>
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;