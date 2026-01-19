import { useState, useEffect } from "react";

export function useOrderSync<T extends { id: string }>(key: string, initialData: T[]) {
    const [orders, setOrders] = useState<T[]>(() => {
        // Initialize from localStorage if available, else use initialData
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse orders from localStorage", e);
            }
        }
        return initialData;
    });

    // Persist modifications to localStorage
    const updateOrder = (orderId: string, updates: Partial<T>) => {
        setOrders((prev) => {
            const newOrders = prev.map((order) =>
                order.id === orderId ? { ...order, ...updates } : order
            );
            localStorage.setItem(key, JSON.stringify(newOrders));

            // Dispatch a custom event so other components in the same tab update immediately
            window.dispatchEvent(new Event("local-storage-orders-update"));

            return newOrders;
        });
    };

    // Listen for storage events (cross-tab) and custom events (same-tab)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent | Event) => {
            if (e.type === "storage" && (e as StorageEvent).key !== key) return;

            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Simple equality check to avoid infinite loops if we were the trigger
                    // (though React setState handles identical updates efficiently)
                    setOrders(parsed);
                } catch (e) {
                    console.error("Failed to parse synced orders", e);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("local-storage-orders-update", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("local-storage-orders-update", handleStorageChange);
        };
    }, [key]);

    return { orders, updateOrder, setOrders };
}
