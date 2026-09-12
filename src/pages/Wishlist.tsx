import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useGetProductsQuery } from "@/services/productApi";
import ProductGrid from "@/components/organisms/ProductGrid";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import { Button } from "@/components/ui/button";

function Wishlist() {
  const wishlistedIds = useSelector((state: RootState) => state.wishlist.productIds);
  const { data, isLoading, error } = useGetProductsQuery({ limit: 194, skip: 0 });

  if (isLoading) return <p>Loading wishlist...</p>;
  if (error) return <ErrorMessage />;

  const wishlistedProducts = data?.products.filter((product) =>
    wishlistedIds.includes(product.id)
  );

  return (
    <div>
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1" /> Back to products
        </Button>
      </Link>

      <h1 className="text-xl font-semibold mb-4">Your Wishlist</h1>
      {wishlistedProducts?.length === 0 && (
        <p className="text-muted-foreground">
          You haven't added any products to your wishlist yet.
        </p>
      )}
      {wishlistedProducts && wishlistedProducts.length > 0 && (
        <ProductGrid products={wishlistedProducts} />
      )}
    </div>
  );
}

export default Wishlist;