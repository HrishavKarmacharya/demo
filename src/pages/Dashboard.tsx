import { useState } from "react";
import { useGetProductsQuery } from "@/services/productApi";
import ProductGrid from "@/components/organisms/ProductGrid";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropDown";
import ProductCardSkeleton from "@/components/molecules/ProductCardSkeleton";
import Pagination from "@/components/molecules/Pagination";
import ErrorMessage from "@/components/atoms/ErrorMessage";

const PRODUCTS_PER_PAGE = 12;

function Dashboard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetProductsQuery({
    limit: PRODUCTS_PER_PAGE,
    skip: (page - 1) * PRODUCTS_PER_PAGE,
  });
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

  const totalPages = data ? Math.ceil(data.total / PRODUCTS_PER_PAGE) : 1;

  return (
    <div>
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
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <ErrorMessage message="Something went wrong while fetching products." />
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

      {!isLoading && !error && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default Dashboard;