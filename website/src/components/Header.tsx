import { Coffee, User, LogOut } from "lucide-react";

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}

const Header = ({ userName, onLogout }: HeaderProps) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#F89800] via-[#FFB74D] to-[#F89800] py-20 md:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-red-600/10 blur-3xl animate-pulse" />
      </div>

      {/* User Profile Section (Floating) */}
      {userName && (
        <div className="absolute top-4 right-4 z-20 animate-fade-in">
          <div className="flex items-center gap-3 rounded-2xl bg-white/20 p-2 pl-4 backdrop-blur-md border border-white/30 shadow-xl">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Akkaunt</span>
              <span className="text-sm font-bold text-white line-clamp-1">Salom, {userName}! 👋</span>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/30 text-white">
              <User className="h-5 w-5" />
            </div>
            <button
              onClick={onLogout}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-100 hover:bg-red-600/40 transition-colors border border-red-400/30"
              title="Tizimdan chiqish"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Main Branding */}
        <div className="mb-8 flex flex-col items-center justify-center animate-fade-in-up">
          <div className="mb-6 p-5 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <Coffee className="h-16 w-16 text-white md:h-20 md:w-20 drop-shadow-lg" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl italic">
            AJABO
          </h1>
          <div className="mt-2 h-2 w-24 bg-red-600 rounded-full shadow-lg" />
        </div>

        {/* Tagline */}
        <p className="mx-auto max-w-lg text-xl md:text-2xl text-white font-bold drop-shadow-md">
          Mazzali va sifatli taomlar maskani 🍔✨
        </p>

        {/* Scrolling indicator or decorative dot */}
        <div className="mt-12 animate-bounce">
          <div className="mx-auto h-1.5 w-1.5 rounded-full bg-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;
