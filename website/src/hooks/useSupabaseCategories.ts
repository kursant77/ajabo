
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Category {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export function useSupabaseCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setCategories(data as Category[]);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();

        const channel = supabase
            .channel("categories_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "categories" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setCategories((prev) => [...prev, payload.new as Category]);
                    } else if (payload.eventType === "UPDATE") {
                        setCategories((prev) =>
                            prev.map((item) => (item.id === payload.new.id ? (payload.new as Category) : item))
                        );
                    } else if (payload.eventType === "DELETE") {
                        setCategories((prev) => prev.filter((item) => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addCategory = async (name: string) => {
        try {
            const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); // Simple slugify
            const { error } = await supabase.from("categories").insert({ name, slug });
            if (error) throw error;
            toast.success("Kategoriya qo'shildi");
        } catch (error) {
            toast.error("Xatolik yuz berdi");
            console.error(error);
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase.from("categories").delete().eq("id", id);
            if (error) throw error;
            toast.success("Kategoriya o'chirildi");
        } catch (error) {
            toast.error("Xatolik yuz berdi");
            console.error(error);
        }
    };

    return { categories, loading, addCategory, deleteCategory };
}
