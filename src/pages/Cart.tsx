import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { useGetProductsQuery } from "@/services/productApi";
import { increaseQuantity, decreaseQuantity } from "@/app/cartSlice";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

function Cart() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetProductsQuery({ limit: 194, skip: 0 });

  if (isLoading) return <p>Loading cart...</p>;
  if (error) return <p className="text-destructive">Something went wrong.</p>;

  const cartWithDetails = cartItems
    .map((item) => {
      const product = data?.products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item) => item !== null);

  const grandTotal = cartWithDetails.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Your Cart</h1>

      {cartWithDetails.length === 0 && (
        <p className="text-muted-foreground">Your cart is empty.</p>
      )}

      {cartWithDetails.length > 0 && (
        <div className="space-y-4">
          {cartWithDetails.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 border rounded-lg p-3"
            >
              <img
                src={item.product.thumbnail}
                alt={item.product.title}
                className="h-16 w-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-muted-foreground">
                  ${item.product.price} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => dispatch(decreaseQuantity(item.productId))}
                >
                  <Minus />
                </Button>
                <span className="w-6 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => dispatch(increaseQuantity(item.productId))}
                >
                  <Plus />
                </Button>
              </div>
              <p className="font-semibold w-16 text-right">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="flex justify-end border-t pt-4">
            <p className="text-lg font-bold">Total: ${grandTotal.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;