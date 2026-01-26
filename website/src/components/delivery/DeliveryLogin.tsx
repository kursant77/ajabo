import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Truck, Eye, EyeOff } from "lucide-react";
import { DEMO_CREDENTIALS } from "@/data/deliveryData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const DeliveryLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("role", "delivery")
        .single();

      if (error || !data) {
        toast.error("Login yoki parol noto'g'ri");
      } else {
        const displayName = data.display_name || data.full_name || data.username;
        localStorage.setItem(
          "deliveryAuth",
          JSON.stringify({
            isLoggedIn: true,
            displayName: displayName,
          })
        );
        toast.success(`Xush kelibsiz, ${displayName}!`);
        navigate("/delivery/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Tizim xatoligi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full bg-primary p-4">
            <Coffee className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Ajabo
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Dastavka paneli</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-card p-6 shadow-cafe-lg md:p-8">
          <h2 className="mb-6 text-xl font-semibold text-card-foreground">
            Tizimga kirish
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Login
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Foydalanuvchi nomi"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 rounded-lg bg-secondary/50 p-4">
            <p className="text-center text-sm text-muted-foreground">
              <strong>Demo ma'lumotlar:</strong>
              <br />
              Login: <code className="rounded bg-muted px-1">dastavkachi</code>
              <br />
              Parol: <code className="rounded bg-muted px-1">demo123</code>
            </p>
          </div>
        </div>

        {/* Back to menu */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Menyuga qaytish
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
