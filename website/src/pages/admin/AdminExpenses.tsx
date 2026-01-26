
import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    AlertTriangle,
    Edit2,
    Trash2,
    DollarSign,
    Calendar,
    Database
} from "lucide-react";
import { useSupabaseExpenses, ExpenseItem } from "@/hooks/useSupabaseExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import StatsCard from "@/components/admin/StatsCard";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminExpenses = () => {
    const { expenses, loading, addExpense, updateExpense, deleteExpense, tableExists } = useSupabaseExpenses();

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
    const [formData, setFormData] = useState({
        amount: 0,
        category: "Oylik",
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    // Filter Logic
    const filteredExpenses = useMemo(() => {
        return expenses.filter((item) => {
            return (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    }, [expenses, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
        const thisMonth = new Date().getMonth();
        const thisMonthAmount = expenses
            .filter(item => new Date(item.date).getMonth() === thisMonth)
            .reduce((sum, item) => sum + item.amount, 0);
        const categories = new Set(expenses.map(item => item.category)).size;

        return { totalAmount, thisMonthAmount, categories };
    }, [expenses]);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            amount: 0,
            category: "Oylik",
            description: "",
            date: new Date().toISOString().split('T')[0]
        });
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (item: ExpenseItem) => {
        setEditingItem(item);
        setFormData({
            amount: item.amount,
            category: item.category,
            description: item.description,
            date: new Date(item.date).toISOString().split('T')[0]
        });
        setIsAddDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: Number(formData.amount)
        };

        if (editingItem) {
            await updateExpense(editingItem.id, data);
        } else {
            await addExpense(data);
        }
        setIsAddDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Haqiqatan ham ushbu xarajatni o'chirmoqchimisiz?")) {
            deleteExpense(id);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
    };

    const sqlCode = `
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Simple policy for admin access
CREATE POLICY "Allow all for authenticated" ON expenses FOR ALL USING (true);
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
                            Xarajatlar ma'lumotlarini bazada saqlash uchun quyidagi SQL kodni Supabase Dashboard &rarr; SQL Editor qismida ishlating.
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
                    title="Jami xarajat"
                    value={formatPrice(stats.totalAmount)}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Shu oy xarajati"
                    value={formatPrice(stats.thisMonthAmount)}
                    icon={Calendar}
                    change="Joriy oy"
                    changeType="neutral"
                />
                <StatsCard
                    title="Kategoriyalar"
                    value={stats.categories}
                    icon={Plus}
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Qidirish (kategoriya yoki izoh)..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={handleOpenAdd} className="w-full md:w-auto gap-2">
                    <Plus className="h-4 w-4" /> Xarajat qo'shish
                </Button>
            </div>

            {/* Expenses List */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sana</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategoriya</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Izoh</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Summa</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredExpenses.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium">{format(new Date(item.date), "dd.MM.yyyy")}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-muted-foreground">{item.description || "-"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-red-600">-{formatPrice(item.amount)}</div>
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
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Xarajatlar topilmadi
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
                            <DialogTitle>{editingItem ? "Xarajatni tahrirlash" : "Yangi xarajat qo'shish"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Summa</label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Sana</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Kategoriya</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="Oylik">Oylik (Maosh)</option>
                                    <option value="Soliq">Soliq</option>
                                    <option value="Ijara">Ijara</option>
                                    <option value="Kommunal">Kommunal to'lovlar</option>
                                    <option value="Mahsulotlar">Mahsulotlar xaridi</option>
                                    <option value="Reklama">Reklama / Marketing</option>
                                    <option value="Boshqa">Boshqa xarajatlar</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Izoh (ixtiyoriy)</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Masalan: Dekabr oyi oyliklari"
                                />
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

export default AdminExpenses;
