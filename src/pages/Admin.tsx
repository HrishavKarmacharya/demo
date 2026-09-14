import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Pencil, Plus, Trash2, Upload } from "lucide-react";
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
} from "@/components/ui/dialog";
import SearchBar from "@/components/molecules/SearchBar";
import Pagination from "@/components/molecules/Pagination";
import ErrorMessage from "@/components/atoms/ErrorMessage";

const UNDO_GRACE_MS = 5000;
const ADMIN_PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

type ProductForm = {
  title: string;
  description: string;
  price: string;
  discountPercentage: string;
  category: string;
  stock: string;
  rating: string;
  tags: string;
};

type ProductChanges = {
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: string;
  stock: number;
  rating: number;
  tags: string[];
};

type ConfirmAction =
  | {
      kind: "delete";
      product: Product;
    }
  | {
      kind: "edit";
      product: Product;
      changes: ProductChanges;
      thumbnail?: string;
    }
  | null;

const emptyForm: ProductForm = {
  title: "",
  description: "",
  price: "",
  discountPercentage: "",
  category: "",
  stock: "",
  rating: "",
  tags: "",
};

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
};

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      label: "Out of stock",
      className: "bg-destructive/10 text-destructive",
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Low stock",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  }

  return {
    label: "In stock",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };
}

function Admin() {
  const { data, isLoading, error } = useGetProductsQuery({
    limit: 194,
    skip: 0,
  });

  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");

  const [confirmAction, setConfirmAction] =
    useState<ConfirmAction>(null);

  const deleteTimers = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});

  const editTimers = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});

  const deletedSnapshots = useRef<
    Record<number, { product: Product; index: number }>
  >({});

  const editSnapshots = useRef<Record<number, Product>>({});

  useEffect(() => {
    if (data) {
      setLocalProducts(data.products);
    }
  }, [data]);

  useEffect(() => {
    const deleteTimersAtMount = deleteTimers.current;
    const editTimersAtMount = editTimers.current;

    return () => {
      Object.values(deleteTimersAtMount).forEach(clearTimeout);
      Object.values(editTimersAtMount).forEach(clearTimeout);
    };
  }, []);

  if (isLoading) {
    return <p>Loading admin panel...</p>;
  }

  if (error) {
    return <ErrorMessage />;
  }

  const filteredProducts = localProducts.filter((product) =>
    `${product.title} ${product.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ADMIN_PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);

  const pageProducts = filteredProducts.slice(
    (safePage - 1) * ADMIN_PAGE_SIZE,
    safePage * ADMIN_PAGE_SIZE
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const openEditDialog = (product: Product) => {
    setEditingId(product.id);

    setForm({
      title: product.title ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      discountPercentage: String(
        product.discountPercentage ?? ""
      ),
      category: product.category ?? "",
      stock: String(product.stock ?? ""),
      rating: String(product.rating ?? ""),
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : "",
    });

    setImagePreview(
      product.thumbnail ??
        product.images?.[0] ??
        ""
    );

    setUploadedImage("");
    setDialogOpen(true);
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl =
        typeof reader.result === "string"
          ? reader.result
          : "";

      setUploadedImage(dataUrl);
      setImagePreview(dataUrl);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveClick = async () => {
    const changes: ProductChanges = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      discountPercentage: Number(
        form.discountPercentage || 0
      ),
      category: form.category.trim(),
      stock: Number(form.stock),
      rating: Number(form.rating || 0),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (
      !changes.title ||
      !changes.category ||
      !Number.isFinite(changes.price) ||
      !Number.isFinite(changes.stock)
    ) {
      toast.error(
        "Please complete the required product fields."
      );
      return;
    }

    if (editingId === null) {
      try {
        const result = await addProduct({
          ...changes,
          ...(uploadedImage
            ? {
                thumbnail: uploadedImage,
                images: [uploadedImage],
              }
            : {}),
        }).unwrap();

        const newProduct = {
          ...result,
          description:
            result.description ?? changes.description,
          discountPercentage:
            result.discountPercentage ??
            changes.discountPercentage,
          rating: result.rating ?? changes.rating,
          tags: result.tags ?? changes.tags,
          thumbnail:
            result.thumbnail ||
            uploadedImage ||
            "",
          images:
            result.images?.length
              ? result.images
              : uploadedImage
                ? [uploadedImage]
                : [],
          reviews: result.reviews ?? [],
        } as Product;

        setLocalProducts((prev) => [
          newProduct,
          ...prev,
        ]);

        toast.success("Product added", {
          description: changes.title,
        });

        closeEditDialog(false);
      } catch {
        toast.error("Unable to add product.");
      }

      return;
    }

    const product = localProducts.find(
      (item) => item.id === editingId
    );

    if (!product) return;

    setDialogOpen(false);

    setConfirmAction({
      kind: "edit",
      product,
      changes,
      thumbnail: uploadedImage || undefined,
    });
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setUploadedImage("");
    setDialogOpen(true);
  };

  const requestDelete = (product: Product) => {
    setConfirmAction({
      kind: "delete",
      product,
    });
  };

  const performEdit = (
    product: Product,
    changes: ProductChanges,
    thumbnail?: string
  ) => {
    const localChanges: Partial<Product> = {
      ...changes,
      ...(thumbnail
        ? {
            thumbnail,
            images: [
              thumbnail,
              ...product.images.slice(1),
            ],
          }
        : {}),
    };

    editSnapshots.current[product.id] = product;

    setLocalProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? { ...item, ...localChanges }
          : item
      )
    );

    const timer = setTimeout(async () => {
      delete editTimers.current[product.id];
      delete editSnapshots.current[product.id];

      try {
        const result = await updateProduct({
          id: product.id,
          changes,
        }).unwrap();

        setLocalProducts((prev) =>
          prev.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  ...result,
                  ...(thumbnail
                    ? { thumbnail }
                    : {}),
                }
              : item
          )
        );
      } catch {
        // Demo API — ignore failures.
      }
    }, UNDO_GRACE_MS);

    editTimers.current[product.id] = timer;

    toast.success("Product updated", {
      description: changes.title,
      duration: UNDO_GRACE_MS,
      action: {
        label: "Undo",
        onClick: () => undoEdit(product.id),
      },
    });
  };

  const undoEdit = (id: number) => {
    const timer = editTimers.current[id];

    if (timer) {
      clearTimeout(timer);
      delete editTimers.current[id];
    }

    const snapshot = editSnapshots.current[id];

    if (!snapshot) return;

    delete editSnapshots.current[id];

    setLocalProducts((prev) =>
      prev.map((item) =>
        item.id === id ? snapshot : item
      )
    );

    toast("Edit undone", {
      description: snapshot.title,
    });
  };

  const performDelete = (product: Product) => {
    const index = localProducts.findIndex(
      (item) => item.id === product.id
    );

    if (index === -1) return;

    deletedSnapshots.current[product.id] = {
      product,
      index,
    };

    setLocalProducts((prev) =>
      prev.filter((item) => item.id !== product.id)
    );

    const timer = setTimeout(async () => {
      delete deleteTimers.current[product.id];
      delete deletedSnapshots.current[product.id];

      try {
        await deleteProduct(product.id).unwrap();
      } catch {
        // Demo API — ignore failures.
      }
    }, UNDO_GRACE_MS);

    deleteTimers.current[product.id] = timer;

    toast("Product deleted", {
      description: product.title,
      duration: UNDO_GRACE_MS,
      action: {
        label: "Undo",
        onClick: () => undoDelete(product.id),
      },
    });
  };

  const undoDelete = (id: number) => {
    const timer = deleteTimers.current[id];

    if (timer) {
      clearTimeout(timer);
      delete deleteTimers.current[id];
    }

    const snapshot = deletedSnapshots.current[id];

    if (!snapshot) return;

    delete deletedSnapshots.current[id];

    setLocalProducts((prev) => {
      const next = [...prev];

      const safeIndex = Math.min(
        snapshot.index,
        next.length
      );

      next.splice(
        safeIndex,
        0,
        snapshot.product
      );

      return next;
    });

    toast("Delete undone", {
      description: snapshot.product.title,
    });
  };

  const closeEditDialog = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      setEditingId(null);
      setForm(emptyForm);
      setImagePreview("");
      setUploadedImage("");
    }
  };

  return (
    <div>
      <Link to="/">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="mr-1" />
          Back to products
        </Button>
      </Link>

      <div className="mb-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Admin — Manage Products
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Manage product details, pricing and inventory
            from one place.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <Button onClick={openAddDialog}>
            <Plus size={16} className="mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      <p className="mb-4 mt-3 text-xs text-muted-foreground">
        This demo uses DummyJSON's simulated update/delete
        endpoints — changes appear here for your session but
        are not saved on their server.
      </p>

      <Dialog
        open={dialogOpen}
        onOpenChange={closeEditDialog}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingId === null
                ? "Add Product"
                : "Edit Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={
                      form.title ||
                      "Product preview"
                    }
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                <Upload size={15} />
                Change image

                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) =>
                    handleImageChange(
                      event.target.files?.[0]
                    )
                  }
                />
              </label>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {editingId === null
                  ? "Optional image for the new product. It is shown for this session."
                  : "A new upload updates the preview for this session. The existing API remains unchanged."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium">
                  Product name
                </label>

                <Input
                  placeholder="Product name"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Product description"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Category
                </label>

                <Input
                  placeholder="Category"
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category:
                        event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Price
                </label>

                <Input
                  placeholder="Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price: event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Stock
                </label>

                <Input
                  placeholder="Stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stock: event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Discount %
                </label>

                <Input
                  placeholder="Discount percentage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountPercentage}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      discountPercentage:
                        event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Rating
                </label>

                <Input
                  placeholder="Rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      rating:
                        event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Tags
                </label>

                <Input
                  placeholder="beauty, makeup"
                  value={form.tags}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tags: event.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    closeEditDialog(false)
                  }
                >
                  Cancel
                </Button>

                <Button onClick={handleSaveClick}>
                  {editingId === null
                    ? "Add product"
                    : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
          }
        }}
        title={
          confirmAction?.kind === "delete"
            ? "Delete product?"
            : "Save changes?"
        }
        description={
          confirmAction?.kind === "delete"
            ? `This will remove "${confirmAction.product.title}" from the list. You'll have a few seconds to undo it after.`
            : confirmAction?.kind === "edit"
              ? `Save changes to "${confirmAction.product.title}"? You'll have a few seconds to undo it after.`
              : ""
        }
        confirmLabel={
          confirmAction?.kind === "delete"
            ? "Delete"
            : "Save"
        }
        variant={
          confirmAction?.kind === "delete"
            ? "destructive"
            : "default"
        }
        onConfirm={() => {
          if (!confirmAction) return;

          if (confirmAction.kind === "delete") {
            performDelete(confirmAction.product);
          } else {
            performEdit(
              confirmAction.product,
              confirmAction.changes,
              confirmAction.thumbnail
            );
          }

          setConfirmAction(null);
        }}
      />

      {filteredProducts.length === 0 && (
        <p className="text-muted-foreground">
          No products match your search.
        </p>
      )}

      {filteredProducts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40 text-left">
              <tr className="border-b">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Image
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Product
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Category
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Price
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Stock
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {pageProducts.map((product) => {
                const stockStatus =
                  getStockStatus(product.stock);

                return (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="h-14 w-14 overflow-hidden rounded-lg border bg-muted">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="max-w-[280px]">
                        <p className="font-medium leading-snug">
                          {product.title}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          ID #{product.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 capitalize align-middle">
                      {product.category ||
                        "Uncategorized"}
                    </td>

                    <td className="px-4 py-3 align-middle font-medium">
                      ${product.price.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      {product.stock}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEditDialog(product)
                          }
                        >
                          <Pencil
                            size={14}
                            className="mr-1"
                          />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Delete ${product.title}`}
                          onClick={() =>
                            requestDelete(product)
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default Admin;