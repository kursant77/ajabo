
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    User as UserIcon,
    ChevronLeft,
    Phone,
    Calendar,
    ShoppingBag,
    MessageSquare,
    ExternalLink,
    Clock,
    DollarSign,
    Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const AdminUserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Fetch user profile
                const { data: userData, error: userError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("telegram_id", id)
                    .single();

                if (userError) throw userError;
                setUser(userData);

                // Fetch user orders
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("telegram_user_id", id)
                    .order("created_at", { ascending: false });

                if (orderError) throw orderError;
                setOrders(orderData);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast.error("Profil ma'lumotlarini yuklashda xatolik");
                navigate("/admin/users");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id, navigate]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        setIsSending(true);
        try {
            await sendTelegramMessage(Number(id), messageText);
            toast.success("Xabar muvaffaqiyatli yuborildi");
            setIsMessageOpen(false);
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
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "delivered":
                return <Badge className="bg-green-100 text-green-700">Yetkazildi</Badge>;
            case "ready":
                return <Badge className="bg-blue-100 text-blue-700">Tayyor</Badge>;
            case "on_way":
                return <Badge className="bg-purple-100 text-purple-700">Yo'lda</Badge>;
            default:
                return <Badge variant="secondary">Kutilmoqda</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <p className="animate-pulse text-muted-foreground">Yuklanmoqda...</p>
            </div>
        );
    }

    const totalSpent = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/users")}
                className="mb-6 gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
                Orqaga qaytish
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <UserIcon className="h-12 w-12" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground text-center">{user?.full_name}</h2>
                            <p className="text-sm text-muted-foreground font-mono">ID: {user?.telegram_id}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{user?.phone}</span>
                            </div>
                            {user?.username && (
                                <div className="flex items-center gap-3 text-sm">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`https://t.me/${user.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        @{user.username}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Ro'yxatdan o'tdi: {formatDate(user?.created_at).split(',')[0]}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-muted/30">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Buyurtmalar</p>
                                <p className="text-lg font-bold text-foreground">{orders.length} ta</p>
                            </div>
                            <div className="p-3 rounded-xl bg-muted/30">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Jami xarajat</p>
                                <p className="text-xs font-bold text-primary truncate">{formatPrice(totalSpent)}</p>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6 gap-2"
                            onClick={() => setIsMessageOpen(true)}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Xabar yuborish
                        </Button>
                    </div>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Buyurtmalar tarixi
                    </h3>

                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                                Hali buyurtmalar mavjud emas
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-card rounded-xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-foreground">{order.product_name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDate(order.created_at)}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Soni: </span>
                                                <span className="font-bold">{order.quantity} dona</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Turi: </span>
                                                <span className="font-medium">
                                                    {order.order_type === "delivery" ? "🚚 Yetkazib berish" : (order.order_type === "takeaway" ? "🥡 O'zi bilan" : "📅 Bron")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-base font-bold text-primary">
                                            {formatPrice(order.total_price || 0)}
                                        </div>
                                    </div>

                                    {order.address && (
                                        <div className="mt-3 p-2 rounded bg-muted/30 text-xs text-muted-foreground border-l-2 border-primary/30">
                                            <span className="font-bold">Manzil: </span> {order.address}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Message Dialog */}
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogContent className="max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            {user?.full_name} ga xabar yuborish
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Xabaringizni bu yerga yozing..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="min-h-[120px] resize-none border-input focus:ring-primary"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMessageOpen(false)} disabled={isSending}>
                            Bekor qilish
                        </Button>
                        <Button onClick={handleSendMessage} disabled={!messageText.trim() || isSending} className="gap-2">
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
        </>
    );
};

export default AdminUserProfile;
