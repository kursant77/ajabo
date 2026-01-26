
import { useState, useMemo } from "react";
import { useSupabaseProducts, type Product } from "@/hooks/useSupabaseProducts";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/admin/Pagination";

const AdminMenu = () => {
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useSupabaseProducts();
  const { categories } = useSupabaseCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    description: "",
    image: "",
    category: "" as any,
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: 0,
        description: "",
        image: "",
        category: "" as any,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await addProduct(formData as Omit<Product, "id">);
    }
    setIsModalOpen(false);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage]);

  if (productsLoading) {
    return <div className="p-8 text-center">Yuklanmoqda...</div>;
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mahsulotlar ({products.length})</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Yangi mahsulot
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedProducts.map((product) => (
          <div key={product.id} className="flex gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {product.description}
                </p>
                <p className="font-medium text-primary">
                  {new Intl.NumberFormat("uz-UZ").format(product.price)} so'm
                </p>
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProduct(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              {editingProduct ? "Mahsulot ma'lumotlarini o'zgartiring va saqlash tugmasini bosing." : "Yangi mahsulot ma'lumotlarini kiriting."}
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategoriya</Label>
              <Select
                value={formData.category}
                onValueChange={(val: any) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug || cat.name.toLowerCase()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Narx</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Rasm URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Tarif</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
              <Button type="submit">{editingProduct ? "Saqlash" : "Qo'shish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminMenu;
