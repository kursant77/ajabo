import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/data/menuData";

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

const categoryLabels: Record<string, string> = {
  kofe: "Kofe",
  choy: "Choy",
  shirinliklar: "Shirinliklar",
  ovqatlar: "Ovqatlar",
};

const MenuItemCard = ({ item, onEdit, onDelete }: MenuItemCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground hover:bg-background/90">
          {categoryLabels[item.category]}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          <span className="text-sm font-bold text-primary">
            {formatPrice(item.price)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Tahrirlash
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
