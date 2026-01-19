import { useState, useMemo } from "react";
import { User, Truck, CheckCircle, XCircle, Plus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseDelivery } from "@/hooks/useSupabaseDelivery";

const AdminDelivery = () => {
  const { personnel, loading, addPerson, deletePerson } = useSupabaseDelivery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleAddNew = async () => {
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      return;
    }

    await addPerson(newName.trim(), newUsername.trim(), newPassword.trim());
    setNewName("");
    setNewUsername("");
    setNewPassword("");
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
      await deletePerson(id);
    }
  };

  // Calculate stats using useMemo
  const { activeCount, totalDeliveries } = useMemo(() => {
    const active = personnel.filter((p) => p.active).length;
    const total = personnel.reduce((sum, p) => sum + p.deliveries, 0);
    return { activeCount: active, totalDeliveries: total };
  }, [personnel]);

  if (loading) {
    return (
      <AdminLayout title="Dastavkachilar">
        <div className="flex justify-center items-center h-48">
          <p>Yuklanmoqda...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dastavkachilar">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yangi dastavkachilar</p>
              <p className="text-2xl font-bold text-foreground">
                {personnel.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faol</p>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami yetkazilganlar</p>
              <p className="text-2xl font-bold text-foreground">
                {totalDeliveries}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dastavkachi qo'shish
        </Button>
      </div>

      {/* Personnel List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm text-muted-foreground">
          <div className="col-span-4">Ism</div>
          <div className="col-span-2">Yetkazilganlar</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-4">Amallar</div>
        </div>

        {personnel.map((person) => (
          <div
            key={person.id}
            className="grid grid-cols-12 gap-4 p-4 border-t border-border/50 items-center"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {person.display_name.charAt(0)}
                </span>
              </div>
              <span className="font-medium text-foreground">{person.display_name}</span>
            </div>
            <div className="col-span-2 text-muted-foreground">
              {person.deliveries} ta
            </div>
            <div className="col-span-2">
              <Badge
                className="bg-green-100 text-green-700 hover:bg-green-100"
              >
                Faol
              </Badge>
            </div>
            <div className="col-span-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(person.id)}
              >
                O'chirish
              </Button>
            </div>
          </div>
        ))}

        {personnel.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Hozircha dastavkachilar yo'q
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi dastavkachi qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">To'liq ism</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ism Familiya"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button onClick={handleAddNew} className="flex-1">
                Qo'shish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDelivery;
