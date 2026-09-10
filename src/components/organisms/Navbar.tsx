import { Link } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";

function Navbar() {
  const wishlistCount = useSelector(
    (state: RootState) => state.wishlist.productIds.length
  );
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-lg font-semibold">Product Dashboard</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/wishlist">
            <Button variant="outline" size="icon" className="relative">
              <Heart />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;