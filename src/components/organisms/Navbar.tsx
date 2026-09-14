import { Link } from "react-router";
import { Heart, ShoppingCart, Moon, Sun, Shield } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import useDarkMode from "@/hooks/useDarkMode";

function Navbar() {
  const wishlistCount = useSelector(
    (state: RootState) => state.wishlist.productIds.length
  );
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-lg font-semibold">Product Dashboard</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="outline" size="icon" aria-label="Admin panel">
              <Shield />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={toggle}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>

          <Link to="/wishlist">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label="Wishlist"
            >
              <Heart />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/cart">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label="Cart"
            >
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