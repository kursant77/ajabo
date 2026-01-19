import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Coffee, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_CREDENTIALS } from "@/data/adminData";
import { supabase } from "@/lib/supabase";

const AdminLogin = () => {
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
        .eq("role", "admin")
        .single();

      if (error || !data) {
        toast.error("Login yoki parol noto'g'ri!");
      } else {
        localStorage.setItem(
          "adminAuth",
          JSON.stringify({
            isAuthenticated: true,
            displayName: data.full_name,
          })
        );
        toast.success(`Xush kelibsiz, ${data.full_name}!`);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Tizim xatoligi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Menyuga qaytish
        </Button>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-cafe-lg border border-border/50 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Coffee className="h-6 w-6 text-primary" />
              Ajabo Admin
            </h1>
            <p className="text-muted-foreground mt-2">
              Admin paneliga kirish
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Login
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Parol
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>

          {/* Demo Hint */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium">Demo kirish:</span>
              <br />
              Login: <code className="text-primary">admin</code> | Parol:{" "}
              <code className="text-primary">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
