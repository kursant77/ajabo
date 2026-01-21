import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type AdminOrder } from "@/data/adminData";

// Define a type that matches the Supabase DB structure (snake_case)
type DBOrder = {
    id: string;
    product_name: string;
    quantity: number;
    customer_name: string;
    phone_number: string;
    status: string;
    address: string;
    created_at: string;
    total_price: number | null;
    delivery_person: string | null;
    telegram_user_id: number | null;
    order_type: string | null;
};

// Map DB row to App Order type
const mapToAppOrder = (row: DBOrder): AdminOrder => ({
    id: row.id,
    productName: row.product_name,
    quantity: row.quantity,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    status: row.status as any,
    address: row.address,
    createdAt: new Date(row.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    rawCreatedAt: new Date(row.created_at),
    totalPrice: row.total_price || 0,
    deliveryPerson: row.delivery_person || undefined,
    telegramUserId: row.telegram_user_id || null,
    orderType: (row.order_type as any) || "delivery",
});

export const useAdminOrdersQuery = (refetchInterval = 5000) => {
    return useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            console.log("🔄 Tanstack Query: Fetching admin orders...");
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data.map(mapToAppOrder);
        },
        refetchInterval: refetchInterval, // Polling interval in ms
        staleTime: 2000,
    });
};
