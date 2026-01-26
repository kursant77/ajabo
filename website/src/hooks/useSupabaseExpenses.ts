
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ExpenseItem {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    created_at: string;
}

export function useSupabaseExpenses() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);

    const fetchExpenses = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("expenses")
                .select("*")
                .order("date", { ascending: false });

            if (error) {
                if (error.code === "PGRST116" || error.message?.includes("relation \"expenses\" does not exist")) {
                    setTableExists(false);
                    // Use localStorage as fallback
                    const saved = localStorage.getItem("temp_expenses");
                    if (saved) setExpenses(JSON.parse(saved));
                    return;
                }
                throw error;
            }

            setExpenses(data || []);
            setTableExists(true);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error("Xarajatlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();

        const channel = supabase
            .channel("expenses_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "expenses" },
                () => fetchExpenses()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchExpenses]);

    const addExpense = async (expense: Omit<ExpenseItem, "id" | "created_at">) => {
        if (!tableExists) {
            const newItem = { ...expense, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
            const newExpenses = [newItem, ...expenses];
            setExpenses(newExpenses);
            localStorage.setItem("temp_expenses", JSON.stringify(newExpenses));
            toast.success("Xarajat saqlandi (vaqtinchalik)");
            return;
        }

        try {
            const { error } = await supabase.from("expenses").insert(expense);
            if (error) throw error;
            toast.success("Xarajat qo'shildi");
            fetchExpenses();
        } catch (error) {
            console.error("Error adding expense:", error);
            toast.error("Xarajat qo'shishda xatolik");
        }
    };

    const updateExpense = async (id: string, updates: Partial<ExpenseItem>) => {
        if (!tableExists) {
            const newExpenses = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
            setExpenses(newExpenses);
            localStorage.setItem("temp_expenses", JSON.stringify(newExpenses));
            toast.success("Xarajat yangilandi (vaqtinchalik)");
            return;
        }

        try {
            const { error } = await supabase.from("expenses").update(updates).eq("id", id);
            if (error) throw error;
            toast.success("Xarajat yangilandi");
            fetchExpenses();
        } catch (error) {
            console.error("Error updating expense:", error);
            toast.error("Xarajatni yangilashda xatolik");
        }
    };

    const deleteExpense = async (id: string) => {
        if (!tableExists) {
            const newExpenses = expenses.filter(e => e.id !== id);
            setExpenses(newExpenses);
            localStorage.setItem("temp_expenses", JSON.stringify(newExpenses));
            toast.success("Xarajat o'chirildi (vaqtinchalik)");
            return;
        }

        try {
            const { error } = await supabase.from("expenses").delete().eq("id", id);
            if (error) throw error;
            toast.success("Xarajat o'chirildi");
            fetchExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
            toast.error("Xarajatni o'chirishda xatolik");
        }
    };

    return { expenses, loading, addExpense, updateExpense, deleteExpense, tableExists };
}
