import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface StaffMember {
    id: string;
    username: string;
    display_name: string;
    active: boolean;
    role: string;
    deliveries?: number; // Only relevant for delivery role
}

export function useSupabaseStaff(role: string = "delivery") {
    const [personnel, setPersonnel] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPersonnel = async () => {
        try {
            // Get all staff for the specific role
            const { data: staffData, error: staffError } = await supabase
                .from("staff")
                .select("*")
                .eq("role", role);

            if (staffError) throw staffError;

            let deliveryCounts: Record<string, number> = {};
            if (role === "delivery") {
                // Get delivery counts for each person - only count completed (delivered) orders
                const { data: ordersData, error: ordersError } = await supabase
                    .from("orders")
                    .select("delivery_person, status")
                    .eq("status", "delivered");

                if (ordersError) throw ordersError;

                // Count deliveries per person
                ordersData.forEach((order) => {
                    if (order.delivery_person) {
                        deliveryCounts[order.delivery_person] =
                            (deliveryCounts[order.delivery_person] || 0) + 1;
                    }
                });
            }

            // Map staff to StaffMember
            const mapped: StaffMember[] = (staffData || []).map((staff) => {
                const displayName = staff.display_name || staff.username;
                return {
                    id: staff.id,
                    username: staff.username,
                    display_name: displayName,
                    active: true,
                    role: staff.role,
                    deliveries: role === "delivery" ? (deliveryCounts[displayName] || 0) : undefined,
                };
            });

            setPersonnel(mapped);
        } catch (error) {
            console.error(`Error fetching ${role} personnel:`, error);
            toast.error("Ishchilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonnel();

        // Set up real-time subscription for staff changes
        const staffChannel = supabase
            .channel(`staff_channel_${role}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "staff", filter: `role=eq.${role}` },
                () => {
                    fetchPersonnel();
                }
            )
            .subscribe();

        // Only subscribe to orders if role is delivery
        let ordersChannel: any = null;
        if (role === "delivery") {
            ordersChannel = supabase
                .channel("delivery_orders_channel")
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "orders" },
                    () => {
                        fetchPersonnel();
                    }
                )
                .subscribe();
        }

        return () => {
            supabase.removeChannel(staffChannel);
            if (ordersChannel) supabase.removeChannel(ordersChannel);
        };
    }, [role]);

    const addPerson = async (displayName: string, username: string, password: string) => {
        try {
            const { error } = await supabase.from("staff").insert({
                username,
                password,
                display_name: displayName,
                role: role,
            });

            if (error) throw error;
            toast.success("Ishchi qo'shildi");
            fetchPersonnel();
        } catch (error) {
            console.error("Error adding staff member:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const deletePerson = async (id: string) => {
        try {
            const { error } = await supabase.from("staff").delete().eq("id", id);

            if (error) throw error;
            toast.success("Ishchi o'chirildi");
            fetchPersonnel();
        } catch (error) {
            console.error("Error deleting staff member:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    return { personnel, loading, addPerson, deletePerson };
}
