import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "@/pages/Dashboard";
import ProductDetails from "@/pages/ProductDetails";
import DashboardLayout from "@/components/templates/DashboardLayout";

function AppRouter() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default AppRouter;