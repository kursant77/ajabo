import { useState, useEffect } from "react";
import { Save, Store, Clock, MapPin, Phone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSupabaseSettings, CafeSettings } from "@/hooks/useSupabaseSettings";

const AdminSettings = () => {
  const { settings, loading, updateSettings } = useSupabaseSettings();
  const [localSettings, setLocalSettings] = useState<CafeSettings | null>(null);

  // Sync local state when settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (localSettings) {
      await updateSettings(localSettings);
    }
  };

  if (loading || !localSettings) {
    return (
      <AdminLayout title="Sozlamalar">
        <div className="flex items-center justify-center h-48">
          <p className="animate-pulse text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sozlamalar">
      <div className="max-w-2xl">
        {/* General Settings */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Umumiy ma'lumotlar
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kafe nomi</label>
              <Input
                value={localSettings.cafe_name}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, cafe_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Manzil</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={localSettings.address}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, address: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={localSettings.phone}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, phone: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tavsif</label>
              <Textarea
                value={localSettings.description}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Ish vaqti
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ochilish vaqti</label>
              <Input
                type="time"
                value={localSettings.open_time}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, open_time: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yopilish vaqti</label>
              <Input
                type="time"
                value={localSettings.close_time}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, close_time: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Yetkazib berish sozlamalari
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  Yetkazib berishni yoqish
                </p>
                <p className="text-sm text-muted-foreground">
                  Mijozlar buyurtma berishi mumkin
                </p>
              </div>
              <Switch
                checked={localSettings.delivery_enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, delivery_enabled: checked })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Minimal buyurtma (so'm)
                </label>
                <Input
                  type="number"
                  value={localSettings.min_order_amount}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      min_order_amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Yetkazish narxi (so'm)
                </label>
                <Input
                  type="number"
                  value={localSettings.delivery_fee}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      delivery_fee: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} size="lg" className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Saqlash
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
