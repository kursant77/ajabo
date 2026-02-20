
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DBTable {
    id: string;
    name: string;
    capacity: number;
    status: "available" | "busy";
    created_at: string;
}

export interface Table {
    id: string;
    name: string;
    capacity: number;
    status: "available" | "busy";
    createdAt: Date;
}

const mapToAppTable = (row: DBTable): Table => ({
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    status: row.status,
    createdAt: new Date(row.created_at),
});

export function useSupabaseTables() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);

    const fetchTables = async () => {
        try {
            const { data, error } = await supabase
                .from("tables" as any) // Cast to any to avoid TS errors if table doesn't exist yet
                .select("*")
                .order("name", { ascending: true });

            if (error) {
                // If table doesn't exist or RLS is blocking access (42501), handle gracefully
                if (error.code === "PGRST205" || error.code === "42501" || error.message?.includes("does not exist")) {
                    console.warn("Table 'tables' access issue (missing or RLS):", error.message);
                    setTableExists(false);
                    setTables([]);
                    return;
                }
                throw error;
            };

            setTables((data as DBTable[]).map(mapToAppTable));
        } catch (error) {
            console.error("Error fetching tables:", error);
            toast.error("Stollarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();

        const channel = supabase
            .channel("tables_channel")
            .on(
                "postgres_changes" as any,
                { event: "*", schema: "public", table: "tables" },
                (payload: any) => {
                    if (payload.eventType === "INSERT") {
                        setTables((prev) => {
                            const newTable = mapToAppTable(payload.new as DBTable);
                            return [...prev, newTable].sort((a, b) => a.name.localeCompare(b.name));
                        });
                    } else if (payload.eventType === "UPDATE") {
                        setTables((prev) =>
                            prev.map((table) =>
                                table.id === payload.new.id ? mapToAppTable(payload.new as DBTable) : table
                            )
                        );
                    } else if (payload.eventType === "DELETE") {
                        setTables((prev) => prev.filter((table) => table.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addTable = useCallback(async (table: Omit<Table, "id" | "createdAt">) => {
        try {
            const { data, error } = await supabase
                .from("tables")
                .insert({
                    name: table.name,
                    capacity: table.capacity,
                    status: table.status || "available",
                })
                .select()
                .single();

            if (error) throw error;
            toast.success("Stol muvaffaqiyatli qo'shildi");
            return data?.id as string;
        } catch (error) {
            console.error("Error adding table:", error);
            toast.error("Stol qo'shishda xatolik");
            return undefined;
        }
    }, []);

    const updateTable = useCallback(async (id: string, updates: Partial<Table>) => {
        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
            if (updates.status !== undefined) dbUpdates.status = updates.status;

            const { error } = await supabase
                .from("tables")
                .update(dbUpdates)
                .eq("id", id);

            if (error) throw error;
            toast.success("Stol yangilandi");
        } catch (error) {
            console.error("Error updating table:", error);
            toast.error("Stolni yangilashda xatolik");
        }
    }, []);

    const deleteTable = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from("tables")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Stol o'chirildi");
        } catch (error) {
            console.error("Error deleting table:", error);
            toast.error("Stolni o'chirishda xatolik");
        }
    }, []);

    return { tables, loading, tableExists, addTable, updateTable, deleteTable, fetchTables };
}
