import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Edit2, Save, X, Mail, Phone, Calendar, FileText, Shield, IdCard } from "lucide-react";
import { toast } from "sonner";

const DriverProfile = () => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  });

  const [editData, setEditData] = useState(profileData);

  // Mock license data - in production, this would come from database
  const [licenseData, setLicenseData] = useState({
    licenseNumber: "DL-1234567890",
    licenseType: "Commercial",
    issuedDate: "2020-01-15",
    expiryDate: "2030-01-14",
    issuingAuthority: "Transport Department",
    vehicleClasses: ["HMV", "LMV", "Transport"],
  });

  const [editLicense, setEditLicense] = useState(licenseData);
  const [isEditingLicense, setIsEditingLicense] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name,
          phone: editData.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfileData(editData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancelProfile = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleSaveLicense = () => {
    setLicenseData(editLicense);
    setIsEditingLicense(false);
    toast.success("License details updated successfully");
  };

  const handleCancelLicense = () => {
    setEditLicense(licenseData);
    setIsEditingLicense(false);
  };

  const getExpiryStatus = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: "Expired", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    if (daysUntilExpiry < 90) return { status: "Expiring Soon", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { status: "Valid", color: "bg-green-500/10 text-green-500 border-green-500/20" };
  };

  return (
    <DashboardLayout userRole="driver" userName={profile?.name || "Driver"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and license details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelProfile} variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSaveProfile} size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground p-2 bg-muted/50 rounded-lg">
                      {profileData.name || profile?.name || "Not set"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <p className="font-medium text-foreground p-2 bg-muted/50 rounded-lg">
                    {profile?.email || user?.email || "Not set"}
                  </p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  ) : (
                    <p className="font-medium text-foreground p-2 bg-muted/50 rounded-lg">
                      {profileData.phone || profile?.phone || "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License Details Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-primary" />
                License Details
              </CardTitle>
              {!isEditingLicense ? (
                <Button onClick={() => setIsEditingLicense(true)} variant="outline" size="sm" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelLicense} variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSaveLicense} size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-lg text-foreground">{licenseData.licenseNumber}</p>
                    <p className="text-sm text-muted-foreground">{licenseData.licenseType} License</p>
                  </div>
                </div>
                <Badge className={getExpiryStatus(licenseData.expiryDate).color}>
                  {getExpiryStatus(licenseData.expiryDate).status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>License Number</Label>
                  {isEditingLicense ? (
                    <Input
                      value={editLicense.licenseNumber}
                      onChange={(e) => setEditLicense({ ...editLicense, licenseNumber: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{licenseData.licenseNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>License Type</Label>
                  {isEditingLicense ? (
                    <Input
                      value={editLicense.licenseType}
                      onChange={(e) => setEditLicense({ ...editLicense, licenseType: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{licenseData.licenseType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  {isEditingLicense ? (
                    <Input
                      type="date"
                      value={editLicense.issuedDate}
                      onChange={(e) => setEditLicense({ ...editLicense, issuedDate: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{licenseData.issuedDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  {isEditingLicense ? (
                    <Input
                      type="date"
                      value={editLicense.expiryDate}
                      onChange={(e) => setEditLicense({ ...editLicense, expiryDate: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{licenseData.expiryDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issuing Authority</Label>
                {isEditingLicense ? (
                  <Input
                    value={editLicense.issuingAuthority}
                    onChange={(e) => setEditLicense({ ...editLicense, issuingAuthority: e.target.value })}
                  />
                ) : (
                  <p className="font-medium text-foreground">{licenseData.issuingAuthority}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Vehicle Classes</Label>
                <div className="flex flex-wrap gap-2">
                  {licenseData.vehicleClasses.map((cls) => (
                    <Badge key={cls} variant="secondary">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Member Since</span>
                </div>
                <p className="font-medium text-foreground">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : "N/A"
                  }
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Account Status</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active
                </Badge>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Role</span>
                </div>
                <p className="font-medium text-foreground capitalize">{profile?.role || "Driver"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverProfile;
