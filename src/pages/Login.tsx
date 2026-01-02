import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Mail, Lock, ArrowRight, Eye, EyeOff, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type LoginType = "driver" | "shipper";

const Login = () => {
  const [activeTab, setActiveTab] = useState<LoginType>("driver");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });

    // Small delay to allow profile to load, then redirect based on role
    setTimeout(() => {
      setIsLoading(false);
      if (profile?.role === "driver") {
        navigate("/driver/matches");
      } else if (profile?.role === "shipper") {
        navigate("/shipper/dashboard");
      } else {
        navigate("/");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col lg:flex-row">
      {/* Driver Section */}
      <div 
        className={`flex-1 flex flex-col items-center justify-center p-6 lg:p-12 transition-all duration-500 relative ${
          activeTab === "driver" 
            ? "bg-gradient-primary" 
            : "bg-muted/50 cursor-pointer hover:bg-muted"
        }`}
        onClick={() => activeTab !== "driver" && setActiveTab("driver")}
      >
        {/* Decorative elements for active state */}
        {activeTab === "driver" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
          </div>
        )}

        <div className={`relative z-10 w-full max-w-md ${activeTab !== "driver" ? "opacity-60" : ""}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              activeTab === "driver" 
                ? "bg-primary-foreground/20 backdrop-blur" 
                : "bg-primary/10"
            }`}>
              <Truck className={`w-10 h-10 ${activeTab === "driver" ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <h2 className={`text-2xl font-display font-bold mb-2 ${
              activeTab === "driver" ? "text-primary-foreground" : "text-foreground"
            }`}>
              Driver Login
            </h2>
            <p className={activeTab === "driver" ? "text-primary-foreground/80" : "text-muted-foreground"}>
              Find loads & optimize your routes
            </p>
          </div>

          {/* Form - Only show when active */}
          {activeTab === "driver" && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="driver-email" className="text-primary-foreground">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/60" />
                  <Input
                    id="driver-email"
                    type="email"
                    placeholder="driver@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="driver-password" className="text-primary-foreground">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary-foreground/80 hover:text-primary-foreground hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/60" />
                  <Input
                    id="driver-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                size="lg" 
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In as Driver
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-primary-foreground/80 text-sm">
                New driver?{" "}
                <Link to="/register" className="text-primary-foreground font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          )}

          {/* Click to select message when inactive */}
          {activeTab !== "driver" && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              Click to sign in as a driver
            </p>
          )}
        </div>
      </div>

      {/* Shipper Section */}
      <div 
        className={`flex-1 flex flex-col items-center justify-center p-6 lg:p-12 transition-all duration-500 relative ${
          activeTab === "shipper" 
            ? "bg-gradient-secondary" 
            : "bg-muted/50 cursor-pointer hover:bg-muted"
        }`}
        onClick={() => activeTab !== "shipper" && setActiveTab("shipper")}
      >
        {/* Decorative elements for active state */}
        {activeTab === "shipper" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-foreground/10 rounded-full blur-3xl" />
          </div>
        )}

        <div className={`relative z-10 w-full max-w-md ${activeTab !== "shipper" ? "opacity-60" : ""}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              activeTab === "shipper" 
                ? "bg-secondary-foreground/20 backdrop-blur" 
                : "bg-secondary/10"
            }`}>
              <Package className={`w-10 h-10 ${activeTab === "shipper" ? "text-secondary-foreground" : "text-secondary"}`} />
            </div>
            <h2 className={`text-2xl font-display font-bold mb-2 ${
              activeTab === "shipper" ? "text-secondary-foreground" : "text-foreground"
            }`}>
              Shipper Login
            </h2>
            <p className={activeTab === "shipper" ? "text-secondary-foreground/80" : "text-muted-foreground"}>
              Post loads & manage shipments
            </p>
          </div>

          {/* Form - Only show when active */}
          {activeTab === "shipper" && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="shipper-email" className="text-secondary-foreground">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/60" />
                  <Input
                    id="shipper-email"
                    type="email"
                    placeholder="shipper@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50 focus:border-secondary-foreground/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="shipper-password" className="text-secondary-foreground">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/60" />
                  <Input
                    id="shipper-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50 focus:border-secondary-foreground/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-foreground/60 hover:text-secondary-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                size="lg" 
                className="w-full bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In as Shipper
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-secondary-foreground/80 text-sm">
                New shipper?{" "}
                <Link to="/register" className="text-secondary-foreground font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          )}

          {/* Click to select message when inactive */}
          {activeTab !== "shipper" && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              Click to sign in as a shipper
            </p>
          )}
        </div>
      </div>

      {/* Logo - Fixed at top */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-display font-bold text-foreground hidden sm:block">
            Load<span className="text-gradient-primary">Loop</span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Login;
