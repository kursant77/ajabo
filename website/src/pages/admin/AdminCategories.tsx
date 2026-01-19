
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Tag } from "lucide-react";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminCategories = () => {
    const { categories, loading, addCategory, deleteCategory } = useSupabaseCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        await addCategory(newCategoryName);
        setNewCategoryName("");
        setIsModalOpen(false);
    }

    return (
        <AdminLayout title="Kategoriyalar">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Barcha Kategoriyalar ({categories.length})</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi kategoriya
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{category.name}</h3>
                                <p className="text-xs text-muted-foreground">{category.slug}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {categories.length === 0 && !loading && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        Hozircha kategoriyalar yo'q.
                    </div>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Yangi kategoriya qo'shish</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nomi</Label>
                            <Input
                                id="name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                required
                                placeholder="Masalan: Kofe"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                            <Button type="submit">Qo'shish</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminCategories;
