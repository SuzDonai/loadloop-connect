import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Building, Save, Loader2 } from "lucide-react";

const ShipperProfile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        phone: formData.phone,
      })
      .eq("id", user.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <DashboardLayout userRole="shipper" userName={profile?.name || "Shipper"}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account details</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">{profile?.name || "Shipper"}</h2>
              <p className="text-muted-foreground capitalize">{profile?.role || "shipper"}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name / Company Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name or company name"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || user?.email || ""}
                disabled
                className="h-12 bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span className="capitalize font-medium">{profile?.role || "Shipper"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperProfile;
