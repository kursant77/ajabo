
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    min_quantity: number;
    category: string;
    last_updated: string;
}

export function useSupabaseInventory() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);

    const fetchInventory = async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("*")
                .order("name", { ascending: true });

            if (error) {
                if (error.code === "PGRST205") {
                    setTableExists(false);
                    // Use mock data if table doesn't exist
                    setItems([
                        { id: "1", name: "Go'sht (Mol)", quantity: 50, unit: "kg", min_quantity: 10, category: "Oziq-ovqat", last_updated: new Date().toISOString() },
                        { id: "2", name: "Un", quantity: 100, unit: "kg", min_quantity: 20, category: "Oziq-ovqat", last_updated: new Date().toISOString() },
                        { id: "3", name: "Pishloq", quantity: 15, unit: "kg", min_quantity: 5, category: "Sut mahsulotlari", last_updated: new Date().toISOString() },
                        { id: "4", name: "Pomidor", quantity: 3, unit: "kg", min_quantity: 5, category: "Sabzavotlar", last_updated: new Date().toISOString() },
                    ]);
                    return;
                }
                throw error;
            }
            setItems(data as InventoryItem[]);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const addItem = async (item: Omit<InventoryItem, "id" | "last_updated">) => {
        if (!tableExists) {
            const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), last_updated: new Date().toISOString() };
            setItems(prev => [...prev, newItem]);
            toast.success("Mahsulot qo'shildi (Lokal saqlandi)");
            return;
        }

        try {
            const { error } = await supabase.from("inventory").insert({ ...item, last_updated: new Date().toISOString() });
            if (error) throw error;
            fetchInventory();
            toast.success("Mahsulot qo'shildi");
        } catch (error) {
            console.error("Error adding inventory item:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
        if (!tableExists) {
            setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, last_updated: new Date().toISOString() } : item));
            toast.success("Mahsulot yangilandi (Lokal)");
            return;
        }

        try {
            const { error } = await supabase.from("inventory").update({ ...updates, last_updated: new Date().toISOString() }).eq("id", id);
            if (error) throw error;
            fetchInventory();
            toast.success("Mahsulot yangilandi");
        } catch (error) {
            console.error("Error updating inventory item:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const deleteItem = async (id: string) => {
        if (!tableExists) {
            setItems(prev => prev.filter(item => item.id !== id));
            toast.success("Mahsulot o'chirildi (Lokal)");
            return;
        }

        try {
            const { error } = await supabase.from("inventory").delete().eq("id", id);
            if (error) throw error;
            fetchInventory();
            toast.success("Mahsulot o'chirildi");
        } catch (error) {
            console.error("Error deleting inventory item:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    return { items, loading, addItem, updateItem, deleteItem, tableExists };
}
