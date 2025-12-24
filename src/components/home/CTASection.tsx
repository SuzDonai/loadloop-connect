import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Package } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to Optimize Your Logistics?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Join thousands of shippers and carriers saving costs and reducing their environmental impact with LoadLoop.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-background text-foreground hover:bg-background/90 shadow-xl"
              asChild
            >
              <Link to="/register?role=shipper">
                <Package className="w-5 h-5" />
                I'm a Shipper
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/register?role=driver">
                <Truck className="w-5 h-5" />
                I'm a Driver
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            No credit card required • Free to get started • 24/7 Support
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
