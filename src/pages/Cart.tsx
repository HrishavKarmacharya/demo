import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Minus, Trash2, Heart } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { useGetProductsQuery } from "@/services/productApi";
import { increaseQuantity, decreaseQuantity, removeFromCart } from "@/app/cartSlice";
import { toggleWishlist } from "@/app/wishlistSlice";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import { toast } from "sonner";

function Cart() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistIds = useSelector((state: RootState) => state.wishlist.productIds);
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetProductsQuery({ limit: 194, skip: 0 });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const cartWithDetails = cartItems
    .map((item) => {
      const product = data?.products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item) => item !== null);

  useEffect(() => {
    setSelectedIds(new Set(cartWithDetails.map((item) => item.productId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  if (isLoading) return <p>Loading cart...</p>;
  if (error) return <ErrorMessage />;

  const allSelected =
    cartWithDetails.length > 0 && selectedIds.size === cartWithDetails.length;

  const toggleAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(cartWithDetails.map((item) => item.productId))
    );
  };

  const toggleOne = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const deleteSelected = () => {
    selectedIds.forEach((id) => dispatch(removeFromCart(id)));
    toast("Removed selected items");
  };

  const selectedItems = cartWithDetails.filter((item) => selectedIds.has(item.productId));
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div>
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1" /> Back to products
        </Button>
      </Link>

      <h1 className="text-xl font-semibold mb-4">Your Cart</h1>

      {cartWithDetails.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-primary"
                />
                Select all ({cartWithDetails.length} items)
              </label>
              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive disabled:opacity-40"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

            <div className="divide-y">
              {cartWithDetails.map((item) => {
                const hasDiscount = item.product.discountPercentage > 1;
                const originalPrice = hasDiscount
                  ? item.product.price / (1 - item.product.discountPercentage / 100)
                  : null;
                const isWishlisted = wishlistIds.includes(item.product.id);

                return (
                  <div key={item.productId} className="flex items-center gap-4 p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.productId)}
                      onChange={() => toggleOne(item.productId)}
                      className="h-4 w-4 accent-primary"
                    />
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {item.product.category}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-semibold text-primary">
                          ${item.product.price}
                        </span>
                        {hasDiscount && originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border rounded-full px-1 py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => dispatch(decreaseQuantity(item.productId))}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="w-5 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => dispatch(increaseQuantity({ productId: item.productId, stock: item.product.stock }))}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => dispatch(toggleWishlist(item.product.id))}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Heart
                          size={16}
                          className={isWishlisted ? "fill-primary text-primary" : ""}
                        />
                      </button>
                      <button
                        onClick={() => dispatch(removeFromCart(item.productId))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border rounded-xl p-5 space-y-3">
            <h2 className="font-semibold">Order Summary</h2>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal ({totalItems} items)
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span className="text-primary font-medium">Free</span>
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <Link to="/checkout">
              <Button className="w-full rounded-full" disabled={selectedItems.length === 0}>
                Proceed to Checkout ({totalItems})
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;