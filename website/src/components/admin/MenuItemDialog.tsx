import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MenuItem, Category } from "@/data/menuData";
import { categories } from "@/data/menuData";

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  onSave: (item: MenuItem) => void;
}

const MenuItemDialog = ({
  open,
  onOpenChange,
  item,
  onSave,
}: MenuItemDialogProps) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    price: 0,
    description: "",
    image: "",
    category: "kofe",
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        name: "",
        price: 0,
        description: "",
        image: "",
        category: "kofe",
      });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as MenuItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nomi</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Mahsulot nomi"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Narxi (so'm)</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kategoriya</label>
            <Select
              value={formData.category}
              onValueChange={(value: Category) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategoriyani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tavsif</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mahsulot tavsifi"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rasm URL</label>
            <Input
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button type="submit" className="flex-1">
              {item ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemDialog;
