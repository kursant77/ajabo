
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface UserProfile {
    telegram_id: number;
    phone: string;
    full_name: string;
    username: string | null;
    created_at?: string;
}

export function useSupabaseUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data as UserProfile[]);
        } catch (error) {
            console.error("Error fetching users:", error);
            // toast.error("Foydalanuvchilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        const channel = supabase
            .channel("profiles_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "profiles" },
                () => {
                    fetchUsers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { users, loading, refetch: fetchUsers };
}
