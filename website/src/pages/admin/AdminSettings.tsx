import { useState } from "react";
import { toast } from "sonner";
import { Save, Store, Clock, MapPin, Phone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    cafeName: "Ajabo Coffee",
    address: "Toshkent shahar, Amir Temur ko'chasi 108",
    phone: "+998 71 123 45 67",
    openTime: "08:00",
    closeTime: "22:00",
    deliveryEnabled: true,
    minOrderAmount: 30000,
    deliveryFee: 10000,
    description: "Eng mazali kofe va taomlar sizni kutmoqda!",
  });

  const handleSave = () => {
    // In real app, this would save to backend
    toast.success("Sozlamalar saqlandi");
  };

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
                value={settings.cafeName}
                onChange={(e) =>
                  setSettings({ ...settings, cafeName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Manzil</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
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
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tavsif</label>
              <Textarea
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
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
                value={settings.openTime}
                onChange={(e) =>
                  setSettings({ ...settings, openTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yopilish vaqti</label>
              <Input
                type="time"
                value={settings.closeTime}
                onChange={(e) =>
                  setSettings({ ...settings, closeTime: e.target.value })
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
                checked={settings.deliveryEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, deliveryEnabled: checked })
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
                  value={settings.minOrderAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minOrderAmount: Number(e.target.value),
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
                  value={settings.deliveryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      deliveryFee: Number(e.target.value),
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
