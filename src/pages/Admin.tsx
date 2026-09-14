import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/productApi";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ErrorMessage from "@/components/atoms/ErrorMessage";

function Admin() {
  const { data, isLoading, error } = useGetProductsQuery({ limit: 20, skip: 0 });
  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  if (data && !hasLoadedOnce) {
    setLocalProducts(data.products);
    setHasLoadedOnce(true);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", price: "", category: "", stock: "" });

  if (isLoading) return <p>Loading admin panel...</p>;
  if (error) return <ErrorMessage />;

  const openAddDialog = () => {
    setEditingId(null);
    setForm({ title: "", price: "", category: "", stock: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const changes = {
      title: form.title,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
    };

    if (editingId) {
      const result = await updateProduct({ id: editingId, changes }).unwrap();
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...result } : p))
      );
      toast.success("Product updated");
    } else {
      const result = await addProduct(changes).unwrap();
      setLocalProducts((prev) => [{ ...result, thumbnail: "", images: [], description: "", discountPercentage: 0, rating: 0, reviews: [], tags: [] } as Product, ...prev]);
      toast.success("Product added");
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id).unwrap();
    setLocalProducts((prev) => prev.filter((p) => p.id !== id));
    toast("Product removed");
  };

  return (
    <div>
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1" /> Back to products
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Admin — Manage Products</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full" onClick={openAddDialog}>
              <Plus size={16} className="mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <Input
                placeholder="Stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <Button className="w-full rounded-full" onClick={handleSave}>
                {editingId ? "Save changes" : "Add product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        This demo uses DummyJSON's simulated add/update/delete endpoints — changes
        appear here for your session but are not saved on their server.
      </p>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {localProducts.map((product) => (
              <tr key={product.id}>
                <td className="p-3">{product.title}</td>
                <td className="p-3 capitalize">{product.category}</td>
                <td className="p-3">${product.price}</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Edit product"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Delete product"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;