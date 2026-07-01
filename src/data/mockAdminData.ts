export const kpiData = {
  todayBookings: 24,
  todayRevenue: '₹1,45,000',
  availableCars: 15,
  pendingRequests: 4,
  customerInquiries: 3,
  underMaintenance: 2
};

export const alertsData = [
  { icon: '⚠️', text: '2 Bookings Waiting for Confirmation' },
  { icon: '🚗', text: '1 Booking Needs Driver Assignment' },
  { icon: '📧', text: '3 New Customer Inquiries' },
  { icon: '🛠', text: '1 Vehicle Under Maintenance' },
];

export const actionRequired = {
  awaitingConfirmation: 2,
  awaitingDriver: 1,
  pendingPayments: 4,
  customerComplaints: 2,
  maintenanceRequests: 1
};

export const fleetStatus = {
  available: 15,
  booked: 8,
  maintenance: 2
};

export const revenueSummary = {
  today: '₹1,45,000',
  yesterday: '₹1,12,000',
  thisMonth: '₹42,50,000'
};

export const recentBookings = [
  { customer: 'Rahul Sharma', vehicle: 'Mercedes S-Class', time: '5 mins ago', status: 'Confirmed' },
  { customer: 'Priya Desai', vehicle: 'BMW 7 Series', time: '15 mins ago', status: 'Pending' },
  { customer: 'Arjun Reddy', vehicle: 'Toyota Fortuner', time: '25 mins ago', status: 'Completed' },
];

export const recentInquiries = [
  { type: 'New Inquiry', subject: 'Corporate Partnership', time: '10 mins ago' },
  { type: 'Complaint', subject: 'Late Arrival', time: '25 mins ago' },
  { type: 'Inquiry', subject: 'Wedding Package', time: '1 hour ago' },
];

export const mockSchedule = [
  {
    time: '08:00 AM',
    title: 'Airport Pickup',
    id: 'VT-1048',
    customer: 'Rahul Sharma',
    phone: '9876543210',
    vehicle: 'Mercedes S-Class',
    plate: 'TS09AB1234',
    driver: 'Ramesh',
    pickup: 'Rajiv Gandhi Int. Airport',
    destination: 'Jubilee Hills',
    status: 'Confirmed',
    payment: 'Paid'
  },
  {
    time: '09:30 AM',
    title: 'Wedding',
    id: 'VT-1049',
    customer: 'Kavya Singh',
    phone: '9123456789',
    vehicle: 'Rolls Royce Ghost',
    plate: 'TS09XY9999',
    driver: 'Suresh',
    pickup: 'Taj Krishna',
    destination: 'Falaknuma Palace',
    status: 'Pending',
    payment: 'Pending'
  },
  {
    time: '11:00 AM',
    title: 'Corporate Transfer',
    id: 'VT-1050',
    customer: 'TCS Group',
    phone: '9888877777',
    vehicle: 'Mercedes V-Class',
    plate: 'TS07CC3333',
    driver: 'Unassigned',
    pickup: 'Hitec City',
    destination: 'Gachibowli',
    status: 'Confirmed',
    payment: 'Paid'
  }
];

// Reusing for the Bookings module placeholder
export const mockBookingsList = [
  {
    id: 'VT-1048',
    customer: 'Rahul Sharma',
    phone: '+91 98765 43210',
    vehicle: 'Mercedes S-Class',
    driver: 'Ramesh',
    pickup: 'Airport',
    date: '2026-07-01',
    amount: '₹ 8,500',
    status: 'Confirmed'
  },
  {
    id: 'VT-1049',
    customer: 'Kavya Singh',
    phone: '+91 91234 56789',
    vehicle: 'Rolls Royce Ghost',
    driver: 'Suresh',
    pickup: 'Taj Krishna',
    date: '2026-07-01',
    amount: '₹ 25,000',
    status: 'Pending'
  },
  {
    id: 'VT-1050',
    customer: 'TCS Group',
    phone: '+91 98888 77777',
    vehicle: 'Mercedes V-Class',
    driver: 'Unassigned',
    pickup: 'Hitec City',
    date: '2026-07-01',
    amount: '₹ 12,000',
    status: 'Confirmed'
  }
];

export const mockInquiriesList = [
  {
    id: 'INQ001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 9876543210',
    subject: 'Corporate Partnership',
    message: 'We are looking for luxury chauffeur services for our executives every month. Please share pricing and availability.',
    status: 'New',
    priority: 'High',
    created_at: '2026-07-01 10:42 AM'
  },
  {
    id: 'INQ002',
    name: 'Priya Reddy',
    email: 'priya.reddy@gmail.com',
    phone: '+91 9123456780',
    subject: 'Complaint about Driver',
    message: 'The chauffeur arrived nearly 20 minutes late for my airport pickup. Please look into this issue.',
    status: 'New',
    priority: 'High',
    created_at: '2026-07-01 09:15 AM'
  },
  {
    id: 'INQ003',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@gmail.com',
    phone: '+91 9988776655',
    subject: 'Wedding Booking',
    message: 'I would like to know whether the Mercedes S-Class is available on 18 August for a wedding event.',
    status: 'Replied',
    priority: 'Medium',
    created_at: '2026-06-30 05:20 PM',
    admin_reply: 'Thank you for contacting Vibe Travels. The Mercedes S-Class is available on your requested date. Our reservations team will contact you shortly with the quotation.'
  }
];

export const mockFleet = [
  {
    car_number: "TS09AB1234",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    fuel_type: "Petrol",
    transmission: "Automatic",
    price_per_day: 18000,
    price_per_km: 85,
    seats: 4,
    color: "Obsidian Black",
    location: "Hyderabad",
    description: "Luxury executive sedan with premium leather interiors, ambient lighting, and rear-seat entertainment.",
    availability_type: "Both",
    status: "Available",
    images: ["/cars/s-class-1.webp", "/cars/s-class-2.webp"],
    created_at: "2025-01-15",
    updated_at: "2026-07-01",
    upcoming_bookings: [
      { date: "2026-07-04", type: "Airport", status: "Booked" },
      { date: "2026-07-08", type: "Wedding", status: "Booked" },
      { date: "2026-07-15", type: "Corporate", status: "Booked" }
    ],
    past_bookings: [
      { name: "Rahul Sharma", type: "Airport Transfer", status: "Completed" },
      { name: "Priya Reddy", type: "Wedding", status: "Completed" }
    ]
  },
  {
    car_number: "TS07CC3333",
    brand: "Mercedes-Benz",
    model: "V-Class",
    year: 2023,
    fuel_type: "Diesel",
    transmission: "Automatic",
    price_per_day: 12000,
    price_per_km: 50,
    seats: 7,
    color: "Silver",
    location: "Hyderabad",
    description: "Spacious luxury van perfect for group travel and corporate events.",
    availability_type: "Rental",
    status: "Maintenance",
    images: ["/cars/v-class.webp"],
    created_at: "2024-11-20",
    updated_at: "2026-06-29",
    upcoming_bookings: [],
    past_bookings: []
  },
  {
    car_number: "TS09XY9999",
    brand: "Rolls-Royce",
    model: "Ghost",
    year: 2024,
    fuel_type: "Petrol",
    transmission: "Automatic",
    price_per_day: 45000,
    price_per_km: 150,
    seats: 4,
    color: "Midnight Blue",
    location: "Hyderabad",
    description: "The ultimate luxury statement. Unmatched presence and comfort.",
    availability_type: "Both",
    status: "Available",
    images: ["/cars/ghost.webp"],
    created_at: "2025-03-10",
    updated_at: "2026-07-01",
    upcoming_bookings: [
      { date: "2026-07-10", type: "Wedding", status: "Booked" }
    ],
    past_bookings: []
  },
  {
    car_number: "TS08EE5555",
    brand: "BMW",
    model: "7 Series",
    year: 2022,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    price_per_day: 15000,
    price_per_km: 75,
    seats: 4,
    color: "Alpine White",
    location: "Hyderabad",
    description: "Dynamic performance meets executive luxury.",
    availability_type: "Rental",
    status: "Archived",
    images: ["/cars/7-series.webp"],
    created_at: "2023-05-15",
    updated_at: "2025-12-01",
    upcoming_bookings: [],
    past_bookings: [
       { name: "Arjun Kumar", type: "Corporate", status: "Completed" }
    ]
  }
];

export const mockCustomers = [
  {
    id: "CUST-001",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@gmail.com",
    joined_date: "May 2025",
    total_bookings: 8,
    total_spent: 182000,
    preferred_vehicle: "Mercedes S-Class",
    last_booking: "2 Days Ago",
    status: "Active",
    ongoing_ride: null,
    bookings: [
      { id: "VT-1048", type: "Airport Transfer", vehicle: "Mercedes S-Class", vehicle_no: "TS09AB1234", driver: "Ramesh", pickup: "Airport", destination: "Jubilee Hills", status: "Completed", amount: 18000, date: "12 Jun 2026", payment: "Paid" },
      { id: "VT-1049", type: "Corporate", vehicle: "BMW 7 Series", vehicle_no: "TS08EE5555", driver: "Kiran", pickup: "Hitec City", destination: "Gachibowli", status: "Completed", amount: 15000, date: "10 Jun 2026", payment: "Paid" },
      { id: "VT-1050", type: "Wedding", vehicle: "Rolls-Royce Ghost", vehicle_no: "TS09XY9999", driver: "Ajay", pickup: "Banjara Hills", destination: "Falaknuma Palace", status: "Cancelled", amount: 45000, date: "01 Jun 2026", payment: "Refunded" }
    ],
    support_history: [
      { type: "Complaint", subject: "Late Driver", status: "Resolved", date: "10 Jun 2026" }
    ]
  },
  {
    id: "CUST-002",
    name: "Priya Reddy",
    phone: "+91 91234 56789",
    email: "priya@gmail.com",
    joined_date: "Jan 2026",
    total_bookings: 3,
    total_spent: 52000,
    preferred_vehicle: "BMW 7 Series",
    last_booking: "Today",
    status: "Active",
    ongoing_ride: { type: "Airport Transfer", vehicle: "Mercedes S-Class", driver: "Ramesh", status: "On Trip" },
    bookings: [
      { id: "VT-1055", type: "Airport Transfer", vehicle: "Mercedes S-Class", vehicle_no: "TS09AB1234", driver: "Ramesh", pickup: "Jubilee Hills", destination: "Airport", status: "Confirmed", amount: 18000, date: "01 Jul 2026", payment: "Paid" }
    ],
    support_history: [
      { type: "Inquiry", subject: "Wedding Package", status: "Replied", date: "28 Jun 2026" }
    ]
  },
  {
    id: "CUST-003",
    name: "Arjun Kumar",
    phone: "+91 99887 76655",
    email: "arjun@gmail.com",
    joined_date: "Mar 2024",
    total_bookings: 15,
    total_spent: 325000,
    preferred_vehicle: "Mercedes V-Class",
    last_booking: "Yesterday",
    status: "VIP",
    ongoing_ride: null,
    bookings: [
      { id: "VT-0999", type: "Outstation", vehicle: "Mercedes V-Class", vehicle_no: "TS07CC3333", driver: "Suresh", pickup: "Hyderabad", destination: "Vijayawada", status: "Completed", amount: 25000, date: "30 Jun 2026", payment: "Paid" }
    ],
    support_history: []
  },
  {
    id: "CUST-004",
    name: "Neha Gupta",
    phone: "+91 98888 11111",
    email: "neha@gmail.com",
    joined_date: "2 days ago",
    total_bookings: 0,
    total_spent: 0,
    preferred_vehicle: "N/A",
    last_booking: "N/A",
    status: "Active",
    ongoing_ride: null,
    bookings: [],
    support_history: []
  },
  {
    id: "CUST-005",
    name: "Vikram Singh",
    phone: "+91 97777 22222",
    email: "vikram@gmail.com",
    joined_date: "Aug 2025",
    total_bookings: 5,
    total_spent: 0,
    preferred_vehicle: "N/A",
    last_booking: "1 month ago",
    status: "Blocked",
    ongoing_ride: null,
    bookings: [
      { id: "VT-0850", type: "Corporate", vehicle: "BMW 7 Series", vehicle_no: "TS08EE5555", driver: "Kiran", pickup: "Hitec City", destination: "Airport", status: "Cancelled", amount: 15000, date: "01 Jun 2026", payment: "Refunded" },
      { id: "VT-0851", type: "Corporate", vehicle: "Mercedes S-Class", vehicle_no: "TS09AB1234", driver: "Ramesh", pickup: "Madhapur", destination: "Airport", status: "Cancelled", amount: 18000, date: "15 May 2026", payment: "Refunded" }
    ],
    support_history: []
  }
];
