
import { useState, useMemo } from "react";
import { useSupabaseUsers, UserProfile } from "@/hooks/useSupabaseUsers";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search, User as UserIcon, Calendar, Phone, ExternalLink, MessageSquare, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendTelegramMessage } from "@/lib/telegram";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const AdminUsers = () => {
    const { users, loading } = useSupabaseUsers();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messageText, setMessageText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery) ||
            (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [users, searchQuery]);

    const handleSendMessage = async () => {
        if (!selectedUser || !messageText.trim()) return;

        setIsSending(true);
        try {
            await sendTelegramMessage(selectedUser.telegram_id, messageText);
            toast.success("Xabar muvaffaqiyatli yuborildi");
            setSelectedUser(null);
            setMessageText("");
        } catch (error) {
            toast.error("Xabar yuborishda xatolik yuz berdi");
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Noma'lum";
        return new Date(dateStr).toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <AdminLayout title="Foydalanuvchilar">
                <div className="flex justify-center items-center h-48">
                    <p className="animate-pulse text-muted-foreground">Yuklanmoqda...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Foydalanuvchilar">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                    <span className="text-sm font-bold text-primary">Jami: {users.length} foydalanuvchi</span>
                </div>
            </div>

            {/* Desktop View: Table/List */}
            <div className="hidden md:block bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Foydalanuvchi</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Telefon</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Telegram</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sana</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredUsers.map((user) => (
                            <tr key={user.telegram_id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div className="max-w-[150px]">
                                            <p className="font-semibold text-foreground truncate">{user.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">ID: {user.telegram_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{user.phone}</td>
                                <td className="px-6 py-4">
                                    {user.username ? (
                                        <a
                                            href={`https://t.me/${user.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary flex items-center gap-1 hover:underline"
                                        >
                                            @{user.username}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Mavjud emas</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                    {formatDate(user.created_at)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8 gap-1.5"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        Xabar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredUsers.map((user) => (
                    <div key={user.telegram_id} className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {user.full_name}
                                    </h3>
                                    {user.username && (
                                        <p className="text-xs text-primary">@{user.username}</p>
                                    )}
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">ID: {user.telegram_id}</Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(user.created_at)}</span>
                            </div>
                        </div>

                        <Button
                            variant="default"
                            className="w-full gap-2"
                            onClick={() => setSelectedUser(user)}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Xabar yuborish
                        </Button>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Foydalanuvchilar topilmadi</p>
                </div>
            )}

            {/* Message Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            {selectedUser?.full_name} ga xabar yuborish
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Xabaringizni bu yerga yozing..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="min-h-[120px] resize-none border-input focus:ring-primary"
                        />
                        <p className="mt-2 text-[10px] text-muted-foreground">
                            Ushbu xabar foydalanuvchiga Telegram bot orqali yuboriladi.
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedUser(null)}
                            disabled={isSending}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() || isSending}
                            className="gap-2"
                        >
                            {isSending ? (
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Yuborish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminUsers;
