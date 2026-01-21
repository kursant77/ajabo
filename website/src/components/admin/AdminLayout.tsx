
import { useRef, useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import {
  Coffee,
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Truck,
  LogOut,
  Settings,
  Menu,
  Bell,
  BellOff,
  Tag,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Bosh sahifa",
    path: "/admin/dashboard",
  },
  {
    icon: ShoppingBag,
    label: "Buyurtmalar",
    path: "/admin/orders",
  },
  {
    icon: UtensilsCrossed,
    label: "Menyu boshqaruvi",
    path: "/admin/menu",
  },
  {
    icon: Tag,
    label: "Kategoriyalar",
    path: "/admin/categories",
  },
  {
    icon: BarChart3,
    label: "Statistika",
    path: "/admin/stats",
  },
  {
    icon: Truck,
    label: "Dastavkachilar",
    path: "/admin/delivery",
  },
  {
    icon: Users,
    label: "Foydalanuvchilar",
    path: "/admin/users",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

// Sound URL
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { orders } = useSupabaseOrders();

  // Sound Logic
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrdersLength = useRef(0);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        console.log("Audio play blocked - user interaction required");
      });
    }
  }, [soundEnabled]);

  // Monitor for new orders
  useEffect(() => {
    // Check if new order arrived (length increased) AND it's not the initial load (prev!=0)
    // NOTE: If initial load is 0 and then it loads 5, it might trigger. 
    // Ideally we'd set prevOrdersLength.current = orders.length on mount if we want to skip.
    // But usually initial state is empty array [] then populates.
    // Let's refine: play sound only if prevOrdersLength > 0 (meaning we already had data loaded)
    // OR if we want to sound on first arrival if page was open blank? 
    // Safest: prevOrdersLength.current !== 0 to avoid sound on refresh.
    if (orders.length > prevOrdersLength.current && prevOrdersLength.current !== 0) {
      playNotificationSound();
      toast.success("Yangi buyurtma keldi!");
    }
    prevOrdersLength.current = orders.length;
  }, [orders.length, playNotificationSound]);


  useEffect(() => {
    const authData = localStorage.getItem("adminAuth");
    if (!authData) {
      navigate("/admin");
      return;
    }

    try {
      const { isAuthenticated, displayName } = JSON.parse(authData);
      if (!isAuthenticated) {
        navigate("/admin");
        return;
      }
      setAdminName(displayName);
    } catch {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    toast.success("Tizimdan chiqdingiz");
    navigate("/admin");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
          <Coffee className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground">Ajabo Admin</h1>
          <p className="text-xs text-muted-foreground">Boshqaruv paneli</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50 space-y-1">
        <button
          onClick={() => {
            navigate("/admin/settings");
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          Sozlamalar
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Chiqish
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-card border-r border-border/50 shadow-lg fixed h-full z-40">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border/50">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Sound toggle button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${soundEnabled
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground"
                  }`}
                title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
              >
                {soundEnabled ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </button>

              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {adminName}
                </p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {adminName.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
