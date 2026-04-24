import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users } from "lucide-react";

const teamMembers = [
  "OM RAUT",
  "PRANAY ABLANKAR",
  "SUJAL RAJAPURE",
  "VISHAL UMARE",
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
            <Leaf className="w-4 h-4" />
            Sustainable Logistics Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
            Reduce Empty Miles,{" "}
            <span className="text-gradient-primary">Maximize Profits</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LoadLoop connects shippers with carriers using AI-powered matching to optimize backhaul logistics.
            Cut costs while reducing your carbon footprint.
          </p>

          <div className="flex justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Project Group Members */}
          <div className="pt-12 border-t border-border max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
              <Users className="w-4 h-4" />
              Project Group Members
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teamMembers.map((name) => {
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                return (
                  <div
                    key={name}
                    className="bg-card rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-border flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg shadow-md">
                      {initials}
                    </div>
                    <p className="font-display font-semibold text-sm text-foreground text-center">
                      {name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
