export interface Load {
  id: string;
  pickupCity: string;
  dropCity: string;
  weight: number;
  price: number;
  status: "open" | "assigned";
  createdAt: string;
  matchingRides?: number;
}

export const mockLoads: Load[] = [
  {
    id: "L001",
    pickupCity: "Mumbai",
    dropCity: "Delhi",
    weight: 5,
    price: 25000,
    status: "open",
    createdAt: "2025-12-20T10:00:00Z",
    matchingRides: 3,
  },
  {
    id: "L002",
    pickupCity: "Bangalore",
    dropCity: "Chennai",
    weight: 3,
    price: 12000,
    status: "assigned",
    createdAt: "2025-12-19T14:30:00Z",
    matchingRides: 0,
  },
  {
    id: "L003",
    pickupCity: "Pune",
    dropCity: "Hyderabad",
    weight: 8,
    price: 35000,
    status: "open",
    createdAt: "2025-12-21T09:15:00Z",
    matchingRides: 5,
  },
  {
    id: "L004",
    pickupCity: "Kolkata",
    dropCity: "Jaipur",
    weight: 2,
    price: 18000,
    status: "open",
    createdAt: "2025-12-22T11:00:00Z",
    matchingRides: 2,
  },
  {
    id: "L005",
    pickupCity: "Ahmedabad",
    dropCity: "Surat",
    weight: 1.5,
    price: 5000,
    status: "assigned",
    createdAt: "2025-12-18T16:45:00Z",
    matchingRides: 0,
  },
  {
    id: "L006",
    pickupCity: "Delhi",
    dropCity: "Lucknow",
    weight: 4,
    price: 15000,
    status: "open",
    createdAt: "2025-12-23T08:00:00Z",
    matchingRides: 7,
  },
];

// Mock API functions with simulated delay
export const fetchLoads = (): Promise<Load[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockLoads]);
    }, 800);
  });
};

export const deleteLoad = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockLoads.findIndex((load) => load.id === id);
      if (index !== -1) {
        mockLoads.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};

export const acceptLoad = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const load = mockLoads.find((l) => l.id === id);
      if (load && load.status === "open") {
        load.status = "assigned";
        load.matchingRides = 0;
        resolve(true);
      } else {
        resolve(false);
      }
    }, 600);
  });
};
