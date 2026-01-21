
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CafeSettings {
    cafe_name: string;
    address: string;
    phone: string;
    open_time: string;
    close_time: string;
    delivery_enabled: boolean;
    min_order_amount: number;
    delivery_fee: number;
    description: string;
}

const DEFAULT_SETTINGS: CafeSettings = {
    cafe_name: "Ajabo Coffee",
    address: "Toshkent shahar, Amir Temur ko'chasi 108",
    phone: "+998 71 123 45 67",
    open_time: "08:00",
    close_time: "22:00",
    delivery_enabled: true,
    min_order_amount: 30000,
    delivery_fee: 10000,
    description: "Eng mazali kofe va taomlar sizni kutmoqda!",
};

export function useSupabaseSettings() {
    const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("*")
                .eq("id", 1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Settings row doesn't exist, use defaults
                    return;
                }
                throw error;
            }

            if (data) {
                setSettings({
                    cafe_name: data.cafe_name,
                    address: data.address,
                    phone: data.phone,
                    open_time: data.open_time.substring(0, 5), // '08:00:00' -> '08:00'
                    close_time: data.close_time.substring(0, 5),
                    delivery_enabled: data.delivery_enabled,
                    min_order_amount: data.min_order_amount,
                    delivery_fee: data.delivery_fee,
                    description: data.description,
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (updates: Partial<CafeSettings>) => {
        try {
            // Check if settings table exists by trying to update
            const { error } = await supabase
                .from("settings")
                .upsert({ id: 1, ...updates })
                .eq("id", 1);

            if (error) {
                if (error.message?.includes("relation \"settings\" does not exist")) {
                    toast.error("Ma'lumotlar bazasida 'settings' jadvali topilmadi. SQLni ishlatishingiz kerak.");
                    return;
                }
                throw error;
            }

            setSettings(prev => ({ ...prev, ...updates }));
            toast.success("Sozlamalar saqlandi");
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Xatolik yuz berdi");
        }
    };

    return { settings, loading, updateSettings };
}
