
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import { useAdminOrdersQuery } from "@/hooks/useAdminOrdersQuery";
import { useSupabaseStaff } from "@/hooks/useSupabaseStaff";
import { toast } from "sonner";
import { Search, RefreshCw, Truck, User, Plus } from "lucide-react";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import AdminOrderModal from "@/components/admin/AdminOrderModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type AdminOrder } from "@/data/adminData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Pagination from "@/components/admin/Pagination";

const AdminOrders = () => {
  const { updateOrder } = useSupabaseOrders();
  const { data: orders = [], isLoading, isRefetching } = useAdminOrdersQuery(10000); // Poll every 10 seconds
  const { personnel: deliveryPersonnel } = useSupabaseStaff("delivery");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "processing" | "delivered">("pending");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Memoize handlers to prevent re-creating functions on every render
  const handleStatusChange = useCallback((orderId: string, status: "pending" | "ready" | "on_way" | "delivered") => {
    updateOrder(orderId, { status });
    const order = orders.find(o => o.id === orderId);

    if (status === "delivered") {
      toast.success(order?.orderType === "delivery" ? "Buyurtma yetkazildi!" : "Buyurtma yakunlandi!");
    } else if (status === "ready") {
      toast.success("Buyurtma tayyor deb belgilandi");
    } else {
      toast.success("Buyurtma holati yangilandi");
    }
  }, [updateOrder, orders]);

  const handleAssignDelivery = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
  }, []);

  const confirmAssignment = async (personName: string) => {
    if (!selectedOrderId) return;

    await updateOrder(selectedOrderId, { deliveryPerson: personName, status: "on_way" });
    toast.success(`Tayinlandi: ${personName}`);
    setSelectedOrderId(null);
  };

  // Memoize filtered orders and counts - only recalculate when dependencies change
  const { filteredOrders, pendingCount, processingCount, deliveredCount } = useMemo(() => {
    // Exclude unpaid orders from all admin views
    const paidOrders = (orders as AdminOrder[]).filter(o => o.status !== "pending_payment");

    const filtered = paidOrders.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phoneNumber.includes(searchQuery);

      let matchesStatus = false;
      if (statusFilter === "pending") {
        matchesStatus = order.status === "pending";
      } else if (statusFilter === "processing") {
        matchesStatus = order.status === "ready" || order.status === "on_way";
      } else if (statusFilter === "delivered") {
        matchesStatus = order.status === "delivered";
      }

      return matchesSearch && matchesStatus;
    });

    const pending = paidOrders.filter((o) => o.status === "pending").length;
    const processing = paidOrders.filter((o) => o.status === "ready" || o.status === "on_way").length;
    const delivered = paidOrders.filter((o) => o.status === "delivered").length;

    return {
      filteredOrders: filtered,
      pendingCount: pending,
      processingCount: processing,
      deliveredCount: delivered
    };
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header with Create Order Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Buyurtmalar</h1>
        <Button onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buyurtma kiritish
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isRefetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Yangilanmoqda</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            Kutilmoqda ({pendingCount})
          </Button>
          <Button
            variant={statusFilter === "processing" ? "default" : "outline"}
            onClick={() => setStatusFilter("processing")}
          >
            Jarayonda ({processingCount})
          </Button>
          <Button
            variant={statusFilter === "delivered" ? "default" : "outline"}
            onClick={() => setStatusFilter("delivered")}
          >
            Yetkazildi ({deliveredCount})
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedOrders.map((order) => (
          <AdminOrderCard
            key={order.id}
            order={order}
            onStatusChange={handleStatusChange}
            onAssignDelivery={handleAssignDelivery}
          />
        ))}
      </div>

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
        </div>
      )}
      {/* Assignment Dialog */}
      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Dastavkachi tayinlash
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Ushbu buyurtmani yetkazib berish uchun dastavkachini tanlang:
            </p>
            {deliveryPersonnel.length > 0 ? (
              <div className="grid gap-2">
                {deliveryPersonnel.map((person) => (
                  <Button
                    key={person.id}
                    variant="outline"
                    className="justify-start gap-3 h-12 hover:border-primary hover:bg-primary/5"
                    onClick={() => confirmAssignment(person.display_name)}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {person.display_name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{person.display_name}</span>
                      <span className="text-[10px] text-muted-foreground">ID: {person.id.slice(0, 8)}</span>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Dastavkachilar topilmadi</p>
                <Button variant="link" size="sm" onClick={() => window.location.href = '/admin/delivery'}>
                  Dastavkachi qo'shish
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Order Modal */}
      <AdminOrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </>
  );
};

export default AdminOrders;
