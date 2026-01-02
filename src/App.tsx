import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";


// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverMatches from "./pages/driver/Matches";
import DriverFindLoads from "./pages/driver/FindLoads";
import DriverTripHistory from "./pages/driver/TripHistory";
import DriverMyVehicle from "./pages/driver/MyVehicle";
import DriverProfile from "./pages/driver/Profile";
import DriverRideMap from "./pages/driver/RideMap";
import ShipperDashboard from "./pages/shipper/Dashboard";
import PostCargo from "./pages/shipper/PostCargo";
import ShipperMyLoads from "./pages/shipper/MyLoads";
import ShipperProfile from "./pages/shipper/Profile";
import ShipperLoadHistory from "./pages/shipper/LoadHistory";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Driver Routes */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/matches" element={<DriverMatches />} />
        <Route path="/driver/find-loads" element={<DriverFindLoads />} />
        <Route path="/driver/trip-history" element={<DriverTripHistory />} />
        <Route path="/driver/my-vehicle" element={<DriverMyVehicle />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/ride/:loadId" element={<DriverRideMap />} />

        {/* Shipper Routes */}
        <Route path="/shipper/dashboard" element={<ShipperDashboard />} />
        <Route path="/shipper/post-cargo" element={<PostCargo />} />
        <Route path="/shipper/my-loads" element={<ShipperMyLoads />} />
        <Route path="/shipper/profile" element={<ShipperProfile />} />
        <Route path="/shipper/load-history" element={<ShipperLoadHistory />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
