export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  totalTrips: number;
  experience: string;
  avatar?: string;
  isAvailable: boolean;
}

export const mockDrivers: Driver[] = [
  {
    id: "DRV001",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    vehicleType: "Tata 407",
    vehicleNumber: "MH 12 AB 1234",
    rating: 4.8,
    totalTrips: 234,
    experience: "5 years",
    isAvailable: true,
  },
  {
    id: "DRV002",
    name: "Suresh Patel",
    phone: "+91 87654 32109",
    email: "suresh.patel@email.com",
    vehicleType: "Ashok Leyland",
    vehicleNumber: "GJ 05 CD 5678",
    rating: 4.5,
    totalTrips: 156,
    experience: "3 years",
    isAvailable: true,
  },
  {
    id: "DRV003",
    name: "Anil Sharma",
    phone: "+91 76543 21098",
    email: "anil.sharma@email.com",
    vehicleType: "Eicher Pro",
    vehicleNumber: "RJ 14 EF 9012",
    rating: 4.9,
    totalTrips: 412,
    experience: "8 years",
    isAvailable: true,
  },
  {
    id: "DRV004",
    name: "Vikram Singh",
    phone: "+91 65432 10987",
    email: "vikram.singh@email.com",
    vehicleType: "Bharat Benz",
    vehicleNumber: "DL 01 GH 3456",
    rating: 4.2,
    totalTrips: 89,
    experience: "2 years",
    isAvailable: false,
  },
  {
    id: "DRV005",
    name: "Manoj Yadav",
    phone: "+91 54321 09876",
    email: "manoj.yadav@email.com",
    vehicleType: "Tata Prima",
    vehicleNumber: "UP 32 IJ 7890",
    rating: 4.7,
    totalTrips: 298,
    experience: "6 years",
    isAvailable: true,
  },
];

// Mock API to fetch matching drivers for a load
export async function fetchMatchingDrivers(loadId: string): Promise<Driver[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return random 2-4 drivers as "matching"
  const shuffled = [...mockDrivers].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 3) + 2;
  return shuffled.slice(0, count).filter((d) => d.isAvailable);
}

// Mock API to assign a driver to a load
export async function assignDriver(loadId: string, driverId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
}
