import { 
  Brain, 
  BarChart3, 
  Shield, 
  Clock, 
  Leaf, 
  MapPin 
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Smart algorithms analyze routes, timing, and capacity to find the perfect match for your cargo.",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Track your shipments in real-time with integrated GPS and route optimization.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights on cost savings, efficiency metrics, and environmental impact.",
  },
  {
    icon: Clock,
    title: "TAT Prediction",
    description: "Accurate turnaround time predictions using machine learning models.",
  },
  {
    icon: Leaf,
    title: "Carbon Tracking",
    description: "Monitor and reduce your carbon footprint with detailed CO₂ emission reports.",
  },
  {
    icon: Shield,
    title: "Verified Network",
    description: "All carriers and shippers are verified for a secure and trustworthy marketplace.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Powerful Features for{" "}
            <span className="text-gradient-primary">Modern Logistics</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to optimize your supply chain and reduce empty miles
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-gradient-card rounded-2xl p-6 border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
