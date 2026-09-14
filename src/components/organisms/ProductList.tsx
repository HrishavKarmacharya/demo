import ProductListItem from "@/components/molecules/ProductListItem";
import type { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
}

function ProductList({ products }: ProductListProps) {
  return (
    <div className="border rounded-xl overflow-hidden">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;