import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ShoppingBag, DollarSign, TrendingUp, Package } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/button";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { useSupabaseExpenses } from "@/hooks/useSupabaseExpenses";

const AdminStats = () => {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const { orders } = useSupabaseOrders();
  const { products } = useSupabaseProducts();
  const { expenses } = useSupabaseExpenses();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price);
  };

  // 1. Filter Orders by Period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((o) => {
      const orderDate = new Date(o.rawCreatedAt);
      if (period === "today") {
        return orderDate >= todayStart;
      } else if (period === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return orderDate >= weekStart;
      } else {
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        return orderDate >= monthStart;
      }
    });
  }, [orders, period]);

  // 1.1 Filter Expenses by Period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      if (period === "today") {
        return expenseDate >= todayStart;
      } else if (period === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return expenseDate >= weekStart;
      } else {
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        return expenseDate >= monthStart;
      }
    });
  }, [expenses, period]);

  // 2. Calculate Stats Cards
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const delivered = filteredOrders.filter((o) => o.status === "delivered").length;
    const pending = filteredOrders.filter((o) => o.status === "pending").length;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = revenue - totalExpenses;

    return {
      orders: totalOrders,
      revenue,
      delivered,
      pending,
      totalExpenses,
      netProfit
    };
  }, [filteredOrders, filteredExpenses]);

  // 3. Prepare Chart Data (Daily breakdown for Week/Month, Hourly for Today?)
  // For simplicity, let's keep it daily for Week/Month, and maybe just list orders for Today or keep it daily (only 1 bar).
  // Let's stick to a "Last 7 Days" view for the charts regardless of period filter?
  // Or better: Show dynamic chart based on period. 
  // If "today": breakdown by Hour.
  // If "week": breakdown by Day.
  // If "month": breakdown by Day (or every 3 days).

  const chartData = useMemo(() => {
    if (period === "today") {
      // Hourly grouping
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map(h => {
        const hourOrders = filteredOrders.filter(o => new Date(o.rawCreatedAt).getHours() === h);
        return {
          name: `${h}:00`,
          revenue: hourOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          orders: hourOrders.length
        };
      }).filter(d => d.orders > 0); // Only show active hours? Or all. Let's show active or range.
    } else {
      // Daily grouping
      const daysMap = new Map();

      // Initialize dates based on period
      const now = new Date();
      const daysCount = period === "week" ? 7 : 30;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString("uz-UZ", { weekday: "short", day: "numeric" });
        daysMap.set(key, { name: key, revenue: 0, orders: 0 });
      }

      filteredOrders.forEach(o => {
        const d = new Date(o.rawCreatedAt);
        const key = d.toLocaleDateString("uz-UZ", { weekday: "short", day: "numeric" });
        if (daysMap.has(key)) {
          const entry = daysMap.get(key);
          entry.revenue += (o.totalPrice || 0);
          entry.orders += 1;
        }
      });

      // Add expenses to chart data
      filteredExpenses.forEach(e => {
        const d = new Date(e.date);
        const key = d.toLocaleDateString("uz-UZ", { weekday: "short", day: "numeric" });
        if (daysMap.has(key)) {
          const entry = daysMap.get(key);
          entry.expenses = (entry.expenses || 0) + (e.amount || 0);
        }
      });

      return Array.from(daysMap.values()).map(d => ({
        ...d,
        profit: d.revenue - (d.expenses || 0)
      }));
    }
  }, [filteredOrders, filteredExpenses, period]);


  // 4. Category Pie Chart
  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    const colors: Record<string, string> = {
      "kofe": "hsl(var(--primary))",
      "choy": "#10b981",
      "shirinliklar": "#f59e0b",
      "ovqatlar": "#6366f1"
    };

    filteredOrders.forEach(o => {
      // Find product category
      const product = products.find(p => p.name === o.productName);
      const cat = product?.category || "Boshqa";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    return Array.from(catMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name.toLowerCase()] || "#94a3b8"
    }));
  }, [filteredOrders, products]);


  // 4.1 Expense Category Pie Chart
  const expenseCategoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    const colors: Record<string, string> = {
      "oylik": "#ef4444",
      "soliq": "#f97316",
      "ijara": "#8b5cf6",
      "kommunal": "#06b6d4",
      "mahsulotlar": "#ec4899",
      "reklama": "#0ea5e9",
      "boshqa": "#94a3b8"
    };

    filteredExpenses.forEach(e => {
      const cat = e.category || "Boshqa";
      catMap.set(cat, (catMap.get(cat) || 0) + e.amount);
    });

    return Array.from(catMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[name.toLowerCase()] || "#94a3b8"
    }));
  }, [filteredExpenses]);


  // 5. Top Products
  const topProductsList = useMemo(() => {
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      if (!productSales[o.productName]) {
        productSales[o.productName] = { quantity: 0, revenue: 0 };
      }
      productSales[o.productName].quantity += o.quantity;
      productSales[o.productName].revenue += (o.totalPrice || 0);
    });

    return Object.entries(productSales)
      .map(([name, stats]) => ({
        name,
        sold: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [filteredOrders]);


  return (
    <>
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={period === "today" ? "default" : "outline"}
          onClick={() => setPeriod("today")}
        >
          Bugun
        </Button>
        <Button
          variant={period === "week" ? "default" : "outline"}
          onClick={() => setPeriod("week")}
        >
          Hafta
        </Button>
        <Button
          variant={period === "month" ? "default" : "outline"}
          onClick={() => setPeriod("month")}
        >
          Oy
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Jami buyurtmalar"
          value={stats.orders}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Jami tushum"
          value={`${formatPrice(stats.revenue)} so'm`}
          icon={TrendingUp}
          changeType="positive"
        />
        <StatsCard
          title="Jami xarajat"
          value={`${formatPrice(stats.totalExpenses)} so'm`}
          icon={DollarSign}
          className="bg-red-50/50"
        />
        <StatsCard
          title="Sof foyda"
          value={`${formatPrice(stats.netProfit)} so'm`}
          icon={DollarSign}
          className={stats.netProfit >= 0 ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"}
          change={stats.revenue > 0 ? `${Math.round((stats.netProfit / stats.revenue) * 100)}%` : "0%"}
          changeType={stats.netProfit >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Moliya dinamikasi ({period === 'today' ? 'Soatlik' : 'Kunlik'})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${formatPrice(value)} so'm`,
                    name === "revenue" ? "Tushum" : name === "expenses" ? "Xarajat" : "Sof foyda",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Tushum"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  name="Xarajat"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#ef4444", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--primary))"
                  name="Sof foyda"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Xarajatlar tarkibi
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {expenseCategoryData.length > 0 ? (
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                ) : (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    Ma'lumot yo'q
                  </text>
                )}
                <Tooltip formatter={(value: number) => formatPrice(value) + " so'm"} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Kategoriya bo'yicha sotuvlar
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {categoryData.length > 0 ? (
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                ) : (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    Ma'lumot yo'q
                  </text>
                )}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Eng ko'p sotilgan mahsulotlar
          </h3>
          <div className="space-y-4">
            {topProductsList.length > 0 ? (
              topProductsList.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sold} dona sotildi
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatPrice(product.revenue)} so'm
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Ma'lumot yo'q</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminStats;
