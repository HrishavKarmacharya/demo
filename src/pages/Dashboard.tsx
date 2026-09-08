import { useState } from "react";
import { useGetProductsQuery } from "@/services/productApi";
import ProductGrid from "@/components/organisms/ProductGrid";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropDown";
import ProductCardSkeleton from "@/components/molecules/ProductCardSkeleton";

function Dashboard() {
  const { data, isLoading, error } = useGetProductsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = data
    ? Array.from(new Set(data.products.map((product) => product.category)))
    : [];

  const filteredProducts = data?.products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <FilterDropdown
          categories={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive">
            Something went wrong while fetching products. Please try again.
          </p>
        )}

        {!isLoading && !error && filteredProducts?.length === 0 && (
          <p className="text-muted-foreground">
            No products match your search or filter.
          </p>
        )}

        {!isLoading && !error && filteredProducts && filteredProducts.length > 0 && (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;