
import { useState, useMemo } from "react";
import {
    Download,
    Search,
    Calendar as CalendarIcon,
    FileText,
    TrendingUp,
    ShoppingBag,
    Users
} from "lucide-react";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/admin/StatsCard";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";

const AdminReports = () => {
    const { orders, loading } = useSupabaseOrders();

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
    };

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Search match
            const searchMatch =
                order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.phoneNumber?.includes(searchQuery);

            // Date match
            const orderDate = new Date(order.rawCreatedAt);
            const startMatch = !startDate || orderDate >= new Date(startDate);
            const endMatch = !endDate || orderDate <= new Date(endDate + "T23:59:59");

            // Type match
            const typeMatch = orderTypeFilter === "all" || order.orderType === orderTypeFilter;

            // Status match
            const statusMatch = statusFilter === "all" || order.status === statusFilter;

            return searchMatch && startMatch && endMatch && typeMatch && statusMatch;
        });
    }, [orders, searchQuery, startDate, endDate, orderTypeFilter, statusFilter]);

    // Stats Calculations
    const stats = useMemo(() => {
        const total = filteredOrders.length;
        const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const uniqueCustomers = new Set(filteredOrders.map(o => o.phoneNumber)).size;
        const avgCheck = total > 0 ? Math.round(revenue / total) : 0;

        return { total, revenue, uniqueCustomers, avgCheck };
    }, [filteredOrders]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // CSV Export
    const exportToCSV = () => {
        const headers = ["ID", "Mijoz", "Telefon", "Mahsulot", "Soni", "Narxi", "Turi", "Status", "Sana"];
        const rows = filteredOrders.map(o => [
            o.id.slice(0, 8),
            o.customerName,
            o.phoneNumber,
            o.productName,
            o.quantity,
            o.totalPrice,
            o.orderType,
            o.status,
            format(new Date(o.rawCreatedAt), "dd.MM.yyyy HH:mm")
        ]);

        const content = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `hisobot_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Yuklanmoqda...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Buyurtmalar"
                    value={stats.total}
                    icon={ShoppingBag}
                />
                <StatsCard
                    title="Jami tushum"
                    value={formatPrice(stats.revenue)}
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Mijozlar"
                    value={stats.uniqueCustomers}
                    icon={Users}
                />
                <StatsCard
                    title="O'rtacha chek"
                    value={formatPrice(stats.avgCheck)}
                    icon={FileText}
                />
            </div>

            {/* Filters Section */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Search className="h-4 w-4" /> Qidiruv va Filtrlar
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                placeholder="Mijoz yoki mahsulot nomi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-muted/30"
                            />
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-muted/30"
                                />
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={orderTypeFilter}
                                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">Barcha turlar</option>
                                    <option value="delivery">Dastavka</option>
                                    <option value="takeaway">Soboy</option>
                                    <option value="preorder">Bron</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">Barcha statuslar</option>
                                    <option value="pending">Kutilmoqda</option>
                                    <option value="ready">Tayyor</option>
                                    <option value="on_way">Yo'lda</option>
                                    <option value="delivered">Yakunlandi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={exportToCSV}
                            className="w-full lg:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                        >
                            <Download className="h-4 w-4" />
                            Excelga yuklash (CSV)
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mijoz / Tel</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mahsulot</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Turi</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sana / Vaqt</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Narxi</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-foreground">{order.customerName}</div>
                                        <div className="text-xs text-muted-foreground">{order.phoneNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">{order.productName}</div>
                                        <div className="text-xs text-muted-foreground">{order.quantity} dona</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-[10px] font-medium">
                                            {order.orderType === "delivery" ? "🚚" : order.orderType === "takeaway" ? "🥡" : "📅"} {order.orderType}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {format(new Date(order.rawCreatedAt), "dd.MM.yyyy HH:mm")}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-primary">
                                        {formatPrice(order.totalPrice)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            className={
                                                order.status === "delivered" ? "bg-green-100 text-green-700" :
                                                    order.status === "ready" ? "bg-blue-100 text-blue-700" :
                                                        order.status === "on_way" ? "bg-purple-100 text-purple-700" :
                                                            "bg-red-100 text-red-700"
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Hech qanday ma'lumot topilmadi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-border/50 bg-muted/10">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
