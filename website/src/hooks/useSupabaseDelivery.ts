import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DeliveryPerson {
    id: string;
    username: string;
    display_name: string;
    active: boolean;
    deliveries: number; // Calculated from orders table
}

export function useSupabaseDelivery() {
    const [personnel, setPersonnel] = useState<DeliveryPerson[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPersonnel = async () => {
        try {
            // Get all delivery staff
            const { data: staffData, error: staffError } = await supabase
                .from("staff")
                .select("*")
                .eq("role", "delivery");

            if (staffError) throw staffError;

            // Get delivery counts for each person
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("delivery_person");

            if (ordersError) throw ordersError;

            // Count deliveries per person
            const deliveryCounts: Record<string, number> = {};
            ordersData.forEach((order) => {
                if (order.delivery_person) {
                    deliveryCounts[order.delivery_person] =
                        (deliveryCounts[order.delivery_person] || 0) + 1;
                }
            });

            // Map staff to DeliveryPerson with delivery counts
            const mapped: DeliveryPerson[] = (staffData || []).map((staff) => ({
                id: staff.id,
                username: staff.username,
                display_name: staff.display_name || staff.username,
                active: true, // We can add an "active" column to staff table later if needed
                deliveries: deliveryCounts[staff.display_name] || 0,
            }));

            setPersonnel(mapped);
        } catch (error) {
            console.error("Error fetching delivery personnel:", error);
            toast.error("Dastavkachilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonnel();

        // Set up real-time subscription for staff changes
        const staffChannel = supabase
            .channel("delivery_staff_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "staff", filter: "role=eq.delivery" },
                () => {
                    fetchPersonnel(); // Refetch when staff changes
                }
            )
            .subscribe();

        // Set up real-time subscription for orders changes (for delivery counts)
        const ordersChannel = supabase
            .channel("delivery_orders_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "orders" },
                () => {
                    fetchPersonnel(); // Refetch when orders change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(staffChannel);
            supabase.removeChannel(ordersChannel);
        };
    }, []);

    const addPerson = async (displayName: string, username: string, password: string) => {
        try {
            const { error } = await supabase.from("staff").insert({
                username,
                password, // In production, hash this!
                display_name: displayName,
                role: "delivery",
            });

            if (error) throw error;
            toast.success("Dastavkachi qo'shildi");
            fetchPersonnel(); // Refresh the list
        } catch (error) {
            console.error("Error adding delivery person:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const deletePerson = async (id: string) => {
        try {
            const { error } = await supabase.from("staff").delete().eq("id", id);

            if (error) throw error;
            toast.success("Dastavkachi o'chirildi");
            fetchPersonnel(); // Refresh the list
        } catch (error) {
            console.error("Error deleting delivery person:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    return { personnel, loading, addPerson, deletePerson };
}
