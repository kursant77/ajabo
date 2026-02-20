
import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users,
    BarChart3,
    UtensilsCrossed,
    ArrowLeft,
    Download,
    ShoppingBag,
    Clock,
    Calendar,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseTables } from "@/hooks/useSupabaseTables";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import StatsCard from "@/components/admin/StatsCard";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

const AdminTableDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tables, loading: tablesLoading } = useSupabaseTables();
    const { orders, loading: ordersLoading } = useSupabaseOrders();
    const [searchQuery, setSearchQuery] = useState("");
    const qrRef = useRef<HTMLDivElement>(null);

    const table = useMemo(() => tables.find(t => t.id === id), [tables, id]);

    const tableOrders = useMemo(() => {
        if (!table) return [];
        return orders.filter(o => (o as any).tableName === table.name || (o as any).tableId === table.id);
    }, [table, orders]);

    const filteredOrders = useMemo(() => {
        return tableOrders.filter(o =>
            o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tableOrders, searchQuery]);

    const stats = useMemo(() => {
        const activeOrders = tableOrders.filter(o => o.status !== 'cancelled');
        const revenue = activeOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        return {
            totalOrders: tableOrders.length,
            revenue,
            avgCheck: tableOrders.length > 0 ? Math.round(revenue / tableOrders.length) : 0,
            lastOrder: tableOrders.length > 0 ? tableOrders[0].createdAt : "Noma'lum"
        };
    }, [tableOrders]);

    const handleDownloadQR = () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `${table?.name || 'stol'}_qr.png`;
            link.href = url;
            link.click();
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("uz-UZ").format(price);
    };

    if (tablesLoading || ordersLoading) {
        return <div className="p-8 text-center italic text-muted-foreground">Yuklanmoqda...</div>;
    }

    if (!table) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive mb-4">Stol topilmadi</p>
                <Button onClick={() => navigate("/admin/tables")}>Ortga qaytish</Button>
            </div>
        );
    }

    // QR Code URL - adjust this to your public menu URL
    const menuUrl = `${window.location.origin}/menu?table=${encodeURIComponent(table.name)}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/admin/tables")}
                        className="rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            {table.name}
                            <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-tighter ${table.status === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {table.status === 'busy' ? 'Band' : 'Bo\'sh'}
                            </span>
                        </h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                            <Users className="h-4 w-4" />
                            {table.capacity} kishilik sig'im
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={handleDownloadQR}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        QR Kodni yuklash
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Jami tushum" value={`${formatPrice(stats.revenue)} so'm`} icon={BarChart3} className="border-primary/20 bg-primary/5" />
                <StatsCard title="Buyurtmalar soni" value={stats.totalOrders} icon={ShoppingBag} />
                <StatsCard title="O'rtacha chek" value={`${formatPrice(stats.avgCheck)} so'm`} icon={UtensilsCrossed} />
                <StatsCard title="Oxirgi buyurtma" value={stats.lastOrder} icon={Clock} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* QR Code Section */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-xl font-bold mb-6">Stol QR Kodi</h3>
                        <div ref={qrRef} className="p-6 bg-white rounded-3xl shadow-inner mb-6">
                            <QRCodeCanvas
                                value={menuUrl}
                                size={180}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: "/favicon.ico", // Optional: logo in middle
                                    x: undefined,
                                    y: undefined,
                                    height: 30,
                                    width: 30,
                                    excavate: true,
                                }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Mijozlar ushbu QR kodni skanerlash orqali <br />
                            <strong>{table.name}</strong> uchun buyurtma bera oladilar.
                        </p>
                        <div className="w-full h-12 rounded-xl bg-muted/50 border border-dashed flex items-center justify-center p-2 truncate text-[10px] font-mono opacity-50">
                            {menuUrl}
                        </div>
                    </div>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Buyurtmalar tarixi
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 rounded-xl bg-muted/30 border-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div key={order.id} className="bg-card hover:bg-muted/10 border border-border/50 rounded-2xl p-5 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                                <ShoppingBag className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{order.productName}</h4>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(order.rawCreatedAt), "d MMM, HH:mm", { locale: uz })}
                                                    <span className="mx-1">•</span>
                                                    {order.quantity} dona
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-lg text-primary">{formatPrice(order.totalPrice)} so'm</p>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 opacity-50">
                                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p>Hozircha buyurtmalar yo'q</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTableDetail;
