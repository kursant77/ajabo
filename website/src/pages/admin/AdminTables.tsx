
import { useState, useMemo } from "react";
import {
    Users,
    Plus,
    Trash2,
    BarChart3,
    UtensilsCrossed,
    Layers,
    CheckCircle2,
    Clock,
    ArrowLeft,
    AlertTriangle,
    Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useSupabaseTables, type Table } from "@/hooks/useSupabaseTables";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import StatsCard from "@/components/admin/StatsCard";

const AdminTables = () => {
    const navigate = useNavigate();
    const { tables, loading: tablesLoading, tableExists, addTable, deleteTable } = useSupabaseTables();
    const { orders } = useSupabaseOrders();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newTableName, setNewTableName] = useState("");
    const [newTableCapacity, setNewTableCapacity] = useState(4);
    const [isSaving, setIsSaving] = useState(false);

    // Calculate stats for each table
    const tableStats = useMemo(() => {
        return tables.map(table => {
            // Assuming we'll add table info to orders. For now, let's filter if order has table name/id
            // In useSupabaseOrders, we'll need to check for table identification. 
            // If we use address or customerName as a placeholder for now, or just map it properly later.
            const tableOrders = orders.filter(o =>
                (o as any).tableName === table.name || (o as any).tableId === table.id
            );

            const revenue = tableOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

            return {
                ...table,
                orderCount: tableOrders.length,
                revenue
            };
        });
    }, [tables, orders]);

    const totalRevenue = useMemo(() => {
        return tableStats.reduce((sum, t) => sum + t.revenue, 0);
    }, [tableStats]);

    const handleAddTable = async () => {
        if (!newTableName.trim()) return;
        setIsSaving(true);
        try {
            await addTable({
                name: newTableName,
                capacity: newTableCapacity,
                status: "available"
            });
            setNewTableName("");
            setNewTableCapacity(4);
            setIsAddDialogOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("uz-UZ").format(price);
    };

    const sqlCode = `
-- 1. Stollarni yaratish
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS ni yoqish va siyosatlarni qo'shish
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for tables" ON tables FOR ALL USING (true);

-- 3. Cashback uchun Profiles jadvalini yangilash
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cashback_balance DECIMAL(12, 2) DEFAULT 0;
`.trim();

    if (tablesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground italic">Stollar yuklanmoqda...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {!tableExists && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col md:flex-row items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">Ma'lumotlar bazasi jadvali topilmadi</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            Stollar ma'lumotlarini saqlash va Cashback tizimi ishlashi uchun quyidagi SQL kodni Supabase Dashboard &rarr; SQL Editor qismida ishlating.
                        </p>
                        <details className="cursor-pointer">
                            <summary className="text-xs font-bold text-red-900 dark:text-red-100 border-b border-red-900 dark:border-red-100 inline-block">SQL Kodni ko'rish</summary>
                            <pre className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
                                {sqlCode}
                            </pre>
                        </details>
                    </div>
                    <Button
                        variant="outline"
                        className="border-red-900 text-red-900 hover:bg-red-100 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30 gap-2 shrink-0"
                        onClick={() => {
                            navigator.clipboard.writeText(sqlCode);
                            toast.success("SQL kod nusxalandi!");
                        }}
                    >
                        <Database className="h-4 w-4" /> Nusxalash
                    </Button>
                </div>
            )}
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Jami stollar"
                    value={tables.length}
                    icon={Layers}
                />
                <StatsCard
                    title="Bo'sh stollar"
                    value={tables.filter(t => t.status === "available").length}
                    icon={CheckCircle2}
                    className="text-emerald-600"
                />
                <StatsCard
                    title="Band stollar"
                    value={tables.filter(t => t.status === "busy").length}
                    icon={Clock}
                    className="text-amber-600"
                />
                <StatsCard
                    title="Stollardan tushum"
                    value={`${formatPrice(totalRevenue)} so'm`}
                    icon={BarChart3}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/admin/dashboard")}
                        className="rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                        Mavjud stollar
                    </h2>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Yangi stol qo'shish
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Yangi stol qo'shish</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stol nomi</label>
                                <Input
                                    placeholder="Masalan: Stol 1"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sig'imi (kishi)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={newTableCapacity}
                                    onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 1)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleAddTable}
                                className="w-full rounded-xl"
                                disabled={isSaving || !newTableName.trim()}
                            >
                                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tableStats.map((table) => (
                    <div
                        key={table.id}
                        onClick={() => navigate(`/admin/tables/${table.id}`)}
                        className={`group relative bg-card rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer ${table.status === 'busy' ? 'border-amber-200 bg-amber-50/10' : 'border-border/50'
                            }`}
                    >
                        {/* Status Indicator */}
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl ${table.status === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {table.status === 'busy' ? 'Band' : 'Bo\'sh'}
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <UtensilsCrossed className="h-6 w-6" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteTable(table.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-1">{table.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Users className="h-4 w-4" />
                                {table.capacity} kishilik
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Buyurtmalar:</span>
                                    <span className="font-semibold text-foreground">{table.orderCount} ta</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Umumiy tushum:</span>
                                    <span className="font-bold text-primary">{formatPrice(table.revenue)} so'm</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Progress Bar for Aesthetic */}
                        <div className="h-1.5 w-full bg-secondary">
                            <div
                                className={`h-full transition-all duration-500 ${table.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: table.status === 'busy' ? '100%' : '15%' }}
                            />
                        </div>
                    </div>
                ))}

                {tables.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
                        <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">Hozircha stollar qo'shilmagan</p>
                        <Button
                            variant="link"
                            onClick={() => setIsAddDialogOpen(true)}
                            className="mt-2"
                        >
                            Birinchisini qo'shing
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTables;
