import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "@/pages/Dashboard";
import ProductDetails from "@/pages/ProductDetails";
import Wishlist from "@/pages/Wishlist";
import Cart from "@/pages/Cart";
import NotFound from "@/pages/NotFound";
import DashboardLayout from "@/components/templates/DashboardLayout";
import Checkout from "@/pages/Checkout";

function AppRouter() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default AppRouter;