import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Edit2, Save, X, Fuel, Calendar, FileText, Weight } from "lucide-react";
import { toast } from "sonner";

const MyVehicle = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock vehicle data - in production, this would come from database
  const [vehicleData, setVehicleData] = useState({
    vehicleNumber: "MH 12 AB 1234",
    vehicleType: "truck",
    make: "Tata",
    model: "Prima",
    year: "2022",
    capacity: "16",
    fuelType: "diesel",
    rcExpiry: "2025-12-31",
    insuranceExpiry: "2025-06-30",
    permitExpiry: "2025-08-15",
  });

  const [editData, setEditData] = useState(vehicleData);

  const handleSave = () => {
    setVehicleData(editData);
    setIsEditing(false);
    toast.success("Vehicle details updated successfully");
  };

  const handleCancel = () => {
    setEditData(vehicleData);
    setIsEditing(false);
  };

  const getExpiryStatus = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: "expired", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    if (daysUntilExpiry < 30) return { status: "expiring soon", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { status: "valid", color: "bg-green-500/10 text-green-500 border-green-500/20" };
  };

  return (
    <DashboardLayout userRole="driver" userName={profile?.name || "Driver"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">My Vehicle</h1>
            <p className="text-muted-foreground">Manage your vehicle information and documents</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Details Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Number</Label>
                  {isEditing ? (
                    <Input
                      value={editData.vehicleNumber}
                      onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{vehicleData.vehicleNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  {isEditing ? (
                    <Select
                      value={editData.vehicleType}
                      onValueChange={(value) => setEditData({ ...editData, vehicleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="mini-truck">Mini Truck</SelectItem>
                        <SelectItem value="trailer">Trailer</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium text-foreground capitalize">{vehicleData.vehicleType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Make</Label>
                  {isEditing ? (
                    <Input
                      value={editData.make}
                      onChange={(e) => setEditData({ ...editData, make: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{vehicleData.make}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  {isEditing ? (
                    <Input
                      value={editData.model}
                      onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{vehicleData.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  {isEditing ? (
                    <Input
                      value={editData.year}
                      onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{vehicleData.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  {isEditing ? (
                    <Select
                      value={editData.fuelType}
                      onValueChange={(value) => setEditData({ ...editData, fuelType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium text-foreground capitalize">{vehicleData.fuelType}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Capacity:</span>
                  {isEditing ? (
                    <Input
                      className="w-24 h-8"
                      value={editData.capacity}
                      onChange={(e) => setEditData({ ...editData, capacity: e.target.value })}
                    />
                  ) : (
                    <span className="font-medium text-foreground">{vehicleData.capacity} Tons</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">RC Book</p>
                      {isEditing ? (
                        <Input
                          type="date"
                          className="h-8 mt-1"
                          value={editData.rcExpiry}
                          onChange={(e) => setEditData({ ...editData, rcExpiry: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Expires: {vehicleData.rcExpiry}</p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <Badge className={getExpiryStatus(vehicleData.rcExpiry).color}>
                      {getExpiryStatus(vehicleData.rcExpiry).status}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Insurance</p>
                      {isEditing ? (
                        <Input
                          type="date"
                          className="h-8 mt-1"
                          value={editData.insuranceExpiry}
                          onChange={(e) => setEditData({ ...editData, insuranceExpiry: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Expires: {vehicleData.insuranceExpiry}</p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <Badge className={getExpiryStatus(vehicleData.insuranceExpiry).color}>
                      {getExpiryStatus(vehicleData.insuranceExpiry).status}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Permit</p>
                      {isEditing ? (
                        <Input
                          type="date"
                          className="h-8 mt-1"
                          value={editData.permitExpiry}
                          onChange={(e) => setEditData({ ...editData, permitExpiry: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Expires: {vehicleData.permitExpiry}</p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <Badge className={getExpiryStatus(vehicleData.permitExpiry).color}>
                      {getExpiryStatus(vehicleData.permitExpiry).status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Vehicle Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{vehicleData.vehicleNumber}</p>
                <p className="text-sm text-muted-foreground">Vehicle Number</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Weight className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{vehicleData.capacity}T</p>
                <p className="text-sm text-muted-foreground">Capacity</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Fuel className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground capitalize">{vehicleData.fuelType}</p>
                <p className="text-sm text-muted-foreground">Fuel Type</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{vehicleData.year}</p>
                <p className="text-sm text-muted-foreground">Model Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyVehicle;
