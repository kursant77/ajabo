
import { useState, useMemo } from "react";
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    Edit2,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Database
} from "lucide-react";
import { useSupabaseInventory, InventoryItem } from "@/hooks/useSupabaseInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import StatsCard from "@/components/admin/StatsCard";
import { toast } from "sonner";

const AdminInventory = () => {
    const { items, loading, addItem, updateItem, deleteItem, tableExists } = useSupabaseInventory();

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        quantity: 0,
        unit: "kg",
        min_quantity: 5,
        category: "Oziq-ovqat"
    });

    // Filter Logic
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [items, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        const totalItems = items.length;
        const lowStock = items.filter(item => item.quantity <= item.min_quantity).length;
        const categories = new Set(items.map(item => item.category)).size;

        return { totalItems, lowStock, categories };
    }, [items]);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ name: "", quantity: 0, unit: "kg", min_quantity: 5, category: "Oziq-ovqat" });
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            min_quantity: item.min_quantity,
            category: item.category
        });
        setIsAddDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            await updateItem(editingItem.id, formData);
        } else {
            await addItem(formData);
        }
        setIsAddDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
            deleteItem(id);
        }
    };

    const sqlCode = `
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity DECIMAL DEFAULT 0,
  unit TEXT NOT NULL,
  min_quantity DECIMAL DEFAULT 5,
  category TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Simple policy for admin access
CREATE POLICY "Allow all for authenticated" ON inventory FOR ALL USING (true);
  `.trim();

    if (loading) return <div className="p-8 text-center text-muted-foreground">Yuklanmoqda...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {!tableExists && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-900 mb-1">Ma'lumotlar bazasi jadvali topilmadi</h3>
                        <p className="text-sm text-red-700 mb-4">
                            Omborhona ma'lumotlarini bazada saqlash uchun quyidagi SQL kodni Supabase Dashboard &rarr; SQL Editor qismida ishlating.
                            Hozircha kiritilgan ma'lumotlar faqat vaqtinchalik saqlanadi.
                        </p>
                        <details className="cursor-pointer">
                            <summary className="text-xs font-bold text-red-900 border-b border-red-900 inline-block">SQL Kodni ko'rish</summary>
                            <pre className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
                                {sqlCode}
                            </pre>
                        </details>
                    </div>
                    <Button
                        variant="outline"
                        className="border-red-900 text-red-900 hover:bg-red-100 gap-2 shrink-0"
                        onClick={() => {
                            navigator.clipboard.writeText(sqlCode);
                            toast.success("SQL kod nusxalandi!");
                        }}
                    >
                        <Database className="h-4 w-4" /> Nusxalash
                    </Button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Jami mahsulotlar"
                    value={stats.totalItems}
                    icon={Package}
                />
                <StatsCard
                    title="Kam qolganlar"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    className={stats.lowStock > 0 ? "border-red-200 bg-red-50/30" : ""}
                    change={stats.lowStock > 0 ? "E'tibor bering" : "Hammasi joyida"}
                    changeType={stats.lowStock > 0 ? "negative" : "positive"}
                />
                <StatsCard
                    title="Kategoriyalar"
                    value={stats.categories}
                    icon={ArrowUpRight}
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Mahsulot nomi yoki kategoriya..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={handleOpenAdd} className="w-full md:w-auto gap-2">
                    <Plus className="h-4 w-4" /> Mahsulot qo'shish
                </Button>
            </div>

            {/* Inventory List */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mahsulot</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategoriya</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Miqdori</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredItems.map((item) => {
                                const isLow = item.quantity <= item.min_quantity;
                                return (
                                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={isLow ? "text-red-600 font-bold" : "text-foreground font-medium"}>
                                                    {item.quantity} {item.unit}
                                                </span>
                                                {isLow ? <ArrowDownRight className="h-3 w-3 text-red-500" /> : <ArrowUpRight className="h-3 w-3 text-green-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={isLow ? "destructive" : "outline"}
                                                className={!isLow ? "bg-green-50 text-green-700 border-green-200" : ""}
                                            >
                                                {isLow ? "Kam qolgan" : "Yetarli"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Hech qanday mahsulot topilmadi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Nomi</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Masalan: Mol go'shti"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Miqdori</label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">O'lchov birligi</label>
                                    <Input
                                        required
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="kg, l, dona..."
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Minimal miqdor (ogohlantirish uchun)</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.min_quantity}
                                    onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Kategoriya</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                                    <option value="Ichimliklar">Ichimliklar</option>
                                    <option value="Sut mahsulotlari">Sut mahsulotlari</option>
                                    <option value="Sabzavotlar">Sabzavotlar</option>
                                    <option value="Qadoqlash">Qadoqlash</option>
                                    <option value="Boshqa">Boshqa</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Bekor qilish</Button>
                            <Button type="submit">{editingItem ? "Saqlash" : "Qo'shish"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminInventory;
