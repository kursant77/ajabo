
import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
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
  Package,
  Bell,
  BellOff,
  Tag,
  Users,
  ChevronDown,
  ChefHat,
  HandPlatter,
  GlassWater,
  Briefcase,
  DollarSign,
  ArrowDownRight
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
    icon: Package,
    label: "Omborhona",
    path: "/admin/inventory",
  },
  {
    icon: Briefcase,
    label: "Ishchilar",
    children: [
      {
        icon: Truck,
        label: "Dastavkachilar",
        path: "/admin/delivery",
      },
      {
        icon: ChefHat,
        label: "Oshpazlar",
        path: "/admin/staff/cooks",
      },
      {
        icon: HandPlatter,
        label: "Afitsiantlar",
        path: "/admin/staff/waiters",
      },
      {
        icon: GlassWater,
        label: "Barmenlar",
        path: "/admin/staff/barmen",
      },
    ],
  },
  {
    icon: Users,
    label: "Foydalanuvchilar",
    path: "/admin/users",
  },
  {
    icon: DollarSign,
    label: "Moliya",
    children: [
      {
        icon: ArrowDownRight,
        label: "Xarajatlar",
        path: "/admin/expenses",
      },
      {
        icon: BarChart3,
        label: "Statistika",
        path: "/admin/stats",
      },
    ],
  },
  {
    icon: BarChart3,
    label: "Hisobotlar",
    path: "/admin/reports",
  },
];

interface SidebarItemProps {
  item: typeof menuItems[0];
  location: any;
  navigate: (path: string) => void;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarItem = ({ item, location, navigate, setIsMobileOpen }: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(() => {
    return item.children?.some(child => location.pathname === child.path) || false;
  });
  const isActive = item.path ? location.pathname === item.path : false;
  const isChildActive = item.children?.some(child => location.pathname === child.path);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            isChildActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            {item.label}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="pl-4 space-y-1 mt-1 border-l-2 border-primary/10 ml-6">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildItemActive = location.pathname === child.path;
              return (
                <button
                  key={child.path}
                  onClick={() => {
                    navigate(child.path);
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isChildItemActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ChildIcon className="h-4 w-4" />
                  {child.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        navigate(item.path!);
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
};

interface SidebarContentProps {
  location: any;
  navigate: (path: string) => void;
  setIsMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const SidebarContent = ({ location, navigate, setIsMobileOpen, handleLogout }: SidebarContentProps) => (
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
    <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
      {menuItems.map((item) => (
        <SidebarItem
          key={item.label}
          item={item}
          location={location}
          navigate={navigate}
          setIsMobileOpen={setIsMobileOpen}
        />
      ))}
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

// Sound URL
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const AdminLayout = () => {
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
    if (orders.length > prevOrdersLength.current && prevOrdersLength.current !== 0) {
      playNotificationSound();
      toast.success("Yangi buyurtma keldi!");
    }
    prevOrdersLength.current = orders.length;
  }, [orders.length, playNotificationSound]);


  useEffect(() => {
    const authData = localStorage.getItem("adminAuth");
    if (!authData) {
      if (location.pathname !== "/admin") {
        navigate("/admin");
      }
      return;
    }

    try {
      const { isAuthenticated, displayName } = JSON.parse(authData);
      if (!isAuthenticated) {
        if (location.pathname !== "/admin") {
          navigate("/admin");
        }
        return;
      }
      setAdminName(displayName || "Admin");
    } catch {
      if (location.pathname !== "/admin") {
        navigate("/admin");
      }
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    toast.success("Tizimdan chiqdingiz");
    navigate("/admin");
  };

  const title = useMemo(() => {
    // Check main menu items and children
    for (const item of menuItems) {
      if (item.path === location.pathname) return item.label;
      if (item.children) {
        const child = item.children.find(c => c.path === location.pathname);
        if (child) return child.label;
      }
    }

    // Handle dynamic staff routes
    if (location.pathname.startsWith('/admin/staff/')) {
      const role = location.pathname.split('/').pop();
      switch (role) {
        case 'cooks': return "Oshpazlar";
        case 'waiters': return "Afitsiantlar";
        case 'barmen': return "Barmenlar";
        default: return "Ishchilar";
      }
    }

    // Handle other dynamic routes
    if (location.pathname.startsWith('/admin/users/')) return "Foydalanuvchi profili";
    if (location.pathname === '/admin/settings') return "Sozlamalar";
    if (location.pathname === '/admin/delivery') return "Dastavkachilar";

    return "Boshqaruv paneli";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-card border-r border-border/50 shadow-lg fixed h-full z-40">
        <SidebarContent
          location={location}
          navigate={navigate}
          setIsMobileOpen={setIsMobileOpen}
          handleLogout={handleLogout}
        />
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
                  <SidebarContent
                    location={location}
                    navigate={navigate}
                    setIsMobileOpen={setIsMobileOpen}
                    handleLogout={handleLogout}
                  />
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
        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
