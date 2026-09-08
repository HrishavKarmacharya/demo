import { useParams } from "react-router";
import { useGetProductByIdQuery } from "@/services/productApi";

function ProductDetails() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProductByIdQuery(Number(id));

  if (isLoading) return <p>Loading product...</p>;
  if (error) return <p>Something went wrong while fetching this product.</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="p-6">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-full max-w-md rounded-lg"
      />
      <h1 className="text-2xl font-semibold mt-4">{product.title}</h1>
      <p className="text-muted-foreground mt-2">{product.description}</p>
      <p className="text-xl font-bold mt-4">${product.price}</p>
      <p className="mt-1">Category: {product.category}</p>
      <p className="mt-1">Rating: ⭐ {product.rating}</p>
      <p className="mt-1">
        {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
      </p>
    </div>
  );
}

export default ProductDetails;