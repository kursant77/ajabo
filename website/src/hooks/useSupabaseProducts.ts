
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    is_available?: boolean;
}

export function useSupabaseProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setProducts(data as Product[]);
        } catch (error) {
            console.error("Error fetching products:", error);
            // toast.error("Menyuni yuklashda xatolik"); // Suppress error toast on load to avoid spam if just net glitch
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();

        const channel = supabase
            .channel("products_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "products" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setProducts((prev) => [...prev, payload.new as Product]);
                    } else if (payload.eventType === "UPDATE") {
                        setProducts((prev) =>
                            prev.map((item) => (item.id === payload.new.id ? (payload.new as Product) : item))
                        );
                    } else if (payload.eventType === "DELETE") {
                        setProducts((prev) => prev.filter((item) => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addProduct = async (product: Omit<Product, "id">) => {
        try {
            const { error } = await supabase.from("products").insert(product);
            if (error) throw error;
            toast.success("Mahsulot qo'shildi");
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const { error } = await supabase.from("products").update(updates).eq("id", id);
            if (error) throw error;
            toast.success("Mahsulot yangilandi");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            toast.success("Mahsulot o'chirildi");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    return { products, loading, addProduct, updateProduct, deleteProduct };
}
