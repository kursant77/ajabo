
import { useState, useMemo } from "react";
import { User, Truck, CheckCircle, Plus, Trash2 } from "lucide-react";
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
import { useSupabaseStaff } from "@/hooks/useSupabaseStaff";
import Pagination from "@/components/admin/Pagination";

const AdminDelivery = () => {
  const { personnel, loading, addPerson, deletePerson } = useSupabaseStaff("delivery");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const totalPages = Math.ceil(personnel.length / itemsPerPage);
  const paginatedPersonnel = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return personnel.slice(start, start + itemsPerPage);
  }, [personnel, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami</p>
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dastavkachilar ro'yxati</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Qo'shish
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm text-muted-foreground">
          <div className="col-span-4">Ism</div>
          <div className="col-span-3">Yetkazilganlar</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Amallar</div>
        </div>

        {paginatedPersonnel.map((person) => (
          <div
            key={person.id}
            className="grid grid-cols-12 gap-4 p-4 border-t border-border/50 items-center hover:bg-muted/30 transition-colors"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {person.display_name.charAt(0)}
                </span>
              </div>
              <span className="font-medium text-foreground">{person.display_name}</span>
            </div>
            <div className="col-span-3 text-sm text-muted-foreground">
              {person.deliveries} ta
            </div>
            <div className="col-span-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                Faol
              </Badge>
            </div>
            <div className="col-span-3 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(person.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedPersonnel.map((person) => (
          <div key={person.id} className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-base font-semibold text-primary">
                    {person.display_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{person.display_name}</h3>
                  <p className="text-xs text-muted-foreground">ID: {person.id.slice(0, 8)}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-none shadow-none">Faol</Badge>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>{person.deliveries} ta yetkazilgan</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive p-0 h-auto"
                onClick={() => handleDelete(person.id)}
              >
                O'chirish
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {personnel.length === 0 && (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border/50">
          Hozircha dastavkachilar yo'q
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi dastavkachi qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
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
            <div className="flex gap-3 pt-2">
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
    </>
  );
};

export default AdminDelivery;
