import { memo } from "react";
import { Phone, MapPin, Clock, User, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminOrder } from "@/data/adminData";

interface AdminOrderCardProps {
  order: AdminOrder;
  onStatusChange: (orderId: string, status: "pending" | "ready" | "on_way" | "delivered") => void;
  onAssignDelivery?: (orderId: string) => void;
}

const AdminOrderCard = ({
  order,
  onStatusChange,
  onAssignDelivery,
}: AdminOrderCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price || 0) + " so'm";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Yetkazildi</Badge>;
      case "ready":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Tayyor</Badge>;
      case "on_way":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Jarayonda</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Kutilmoqda</Badge>;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {order.productName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {order.quantity} dona • {formatPrice(order.totalPrice)}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Customer Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{order.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{order.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{order.createdAt}</span>
        </div>
        {order.deliveryPerson && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Truck className="h-4 w-4" />
            <span>{order.deliveryPerson}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {order.status === "pending" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onStatusChange(order.id, "ready")}
            className="w-full"
          >
            Buyurtma tayyor
          </Button>
        )}

        {order.status === "ready" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(order.id, "pending")}
            className="flex-1"
          >
            Qayta ochish
          </Button>
        )}

        {order.status === "delivered" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(order.id, "pending")}
            className="flex-1"
          >
            Qayta ochish
          </Button>
        )}
      </div>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(AdminOrderCard);
