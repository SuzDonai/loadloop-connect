import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Leaf, TrendingDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
              <Leaf className="w-4 h-4" />
              Sustainable Logistics Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Reduce Empty Miles,{" "}
              <span className="text-gradient-primary">Maximize Profits</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              LoadLoop connects shippers with carriers using AI-powered matching to optimize backhaul logistics. 
              Cut costs by up to 40% while reducing your carbon footprint.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/#how-it-works">
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {[
                { value: "0%", label: "Cost Savings" },
                { value: "0", label: "Tons CO₂ Saved" },
                { value: "0", label: "Active Users" },
              ].map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative lg:pl-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card rounded-3xl shadow-xl p-8 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <Truck className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">Smart Match Found</h3>
                    <p className="text-sm text-muted-foreground">0% compatibility score</p>
                  </div>
                </div>

                {/* Route visualization */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <div className="flex-1 h-px bg-gradient-to-r from-secondary to-primary" />
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pune</span>
                    <span className="text-muted-foreground">Mumbai</span>
                  </div>
                </div>

                {/* Savings preview */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-medium">Cost Saved</span>
                    </div>
                    <span className="text-xl font-display font-bold">₹0</span>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                      <Leaf className="w-4 h-4" />
                      <span className="text-xs font-medium">CO₂ Saved</span>
                    </div>
                    <span className="text-xl font-display font-bold">0 tons</span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-card rounded-2xl shadow-lg p-4 border border-border animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Eco Score</div>
                    <div className="font-display font-bold text-secondary">A+</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-lg p-4 border border-border animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-primary-foreground font-medium border-2 border-card"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">+500 today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
