import { Truck, Package, Zap, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Post Your Load",
    description: "Shippers post cargo details including pickup location, destination, weight, and schedule.",
    color: "primary",
  },
  {
    icon: Truck,
    title: "Register Vehicle",
    description: "Carriers register their vehicles with return routes and available capacity.",
    color: "secondary",
  },
  {
    icon: Zap,
    title: "AI Matching",
    description: "Our smart algorithm matches loads with vehicles based on route, timing, and capacity.",
    color: "accent",
  },
  {
    icon: CheckCircle,
    title: "Confirm & Save",
    description: "Accept the match, complete the trip, and track your cost savings and CO₂ reduction.",
    color: "secondary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How LoadLoop Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps to optimize your logistics and reduce empty miles
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-border z-0" />
                )}

                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative z-10">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      step.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : step.color === "secondary"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
