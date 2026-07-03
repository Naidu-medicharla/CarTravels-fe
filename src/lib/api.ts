export const BASE_URL = 'https://vibe-travels.onrender.com';

/**
 * A fetch wrapper for authenticated requests.
 * If the server returns a 401 (token expired / invalid), it automatically
 * clears localStorage so the next page load / auth check logs the user out.
 */
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    // Token is invalid or expired on the backend — clear local session
    localStorage.removeItem('auth_token');
    // Optionally redirect to login if not already there
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  return response;
};

export interface User {
  id: number;
  name?: string;
  email: string;
  role: string;
  phone?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TicketOut {
  ticket_id: number;
  user_id?: number | null;
  full_name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  admin_reply?: string | null;
  status: string; // "NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Car {
  id: number;
  car_number: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  price_per_day: number;
  price_per_km: number;
  seats: number;
  location: string;
  description: string;
  availability_type: string;
  available: boolean;
  is_deleted: boolean;
  images: any[];
}

export interface BookingPreview {
  car_number: string;
  num_days: number;
  car_price: number;
  driver_charges: number;
  total_amount: number;
}

export interface AdminBooking {
  id: number;
  booking_id: string;
  booking_type: string;
  status: string;
  car_charges: number;
  discount: number;
  total_amount_before_discount: number;
  total_amount: number;
  amount_paid: number;
  paid_by: string;
  payment_channel: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  num_days: number;
  driver_required: boolean;
  driver_charges: number;
  pickup_location: string | null;
  drop_location: string | null;
  pickup_date: string | null;
  distance_km: number | null;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  cancel_reason: string | null;
  admin_reject_reason: string | null;
  is_trip_completed: boolean;
  is_rated: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
  car: {
    car_number: string;
    brand: string;
    model: string;
  };
  user: {
    id: number;
    name: string;
  };
}

export interface UpcomingBooking {
  booking_id: string;
  booking_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  pickup_date: string | null;
}

export interface AdminCarOut {
  id: number;
  car_number: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  price_per_day: number;
  price_per_km: number | null;
  seats: number;
  location: string;
  description: string | null;
  availability_type: string;
  available: boolean;
  is_deleted: boolean;
  images: any[];
  upcoming_bookings: UpcomingBooking[];
}

export interface AvailableDriver {
  id: number;
  driver_id: string;
  driver_name: string;
  mobile_number: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserDetails {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  block_reason: string | null;
  bookings: AdminBooking[];
}

export interface DashboardDetailsResponse {
  kpis: {
    today_bookings: number;
    today_revenue: string;
    available_cars: number;
    under_maintenance: number;
  };
  today_schedule: {
    id: string;
    time: string;
    title: string;
    customer: string;
    phone: string;
    vehicle: string;
    plate: string;
    driver: string;
    pickup: string;
    destination: string;
    status: string;
    payment: string;
  }[];
  recent_bookings: {
    customer: string;
    vehicle: string;
    time: string;
    status: string;
  }[];
  revenue_summary: {
    today: string;
    yesterday: string;
    this_month: string;
  };
}

export interface UserProfileResponse {
  name: string;
  email: string;
  phone: string;
  created_at: string;
  total_trips: number;
  total_spend: number;
  avg_rating: number;
  recent_activity: {
    booking_id: string;
    car_name: string;
    date: string;
    amount_paid: number;
  }[];
  all_bookings?: {
    id: number;
    booking_id: string;
    car_name: string;
    booking_type: string;
    status: string;
    start_date: string;
    end_date: string;
    pickup_date: string | null;
    total_amount: number;
    is_trip_completed: boolean;
    is_rated: boolean;
    rating: number | null;
    created_at: string;
    admin_reject_reason?: string;
  }[];
}

export const api = {
  login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
    const params = new URLSearchParams(credentials);
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: params.toString()
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  register: async (data: Record<string, string>): Promise<{ message: string }> => {
    const params = new URLSearchParams(data);
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: params.toString()
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getAllCars: async (token: string): Promise<Car[]> => {
    const response = await authFetch(`${BASE_URL}/admin/all/cars`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch cars';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  previewBooking: async (token: string, params: { car_number: string, start_date: string, end_date: string, driver_required: boolean }): Promise<BookingPreview> => {
    const queryParams = new URLSearchParams({
      car_number: params.car_number,
      start_date: params.start_date,
      end_date: params.end_date,
      driver_required: params.driver_required.toString()
    });
    const response = await authFetch(`${BASE_URL}/bookings/rental/preview?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch booking preview';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  confirmRentalBooking: async (token: string, carNumber: string, payload: any): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/bookings/rental/confirm?car_number=${carNumber}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to confirm booking';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getCarAvailability: async (carNumber: string): Promise<string[]> => {
    const response = await fetch(`${BASE_URL}/cars/${carNumber}/availability`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    if (!response.ok) {
      // In case the backend isn't ready yet, let's not crash the frontend hard. We can return an empty array.
      console.warn('Could not fetch car availability, returning empty array.', await response.text().catch(() => ''));
      return [];
    }
    return response.json();
  },

  getCustomerProfile: async (email: string): Promise<UserProfileResponse> => {
    const response = await fetch(`${BASE_URL}/${email}/profile-details`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch profile details';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  requestCancelBooking: async (token: string, bookingId: number, reason: string): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/bookings/${bookingId}/request-cancel`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      let errorMessage = 'Failed to request cancellation';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  approveCancelBooking: async (token: string, bookingId: number): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/admin/bookings/${bookingId}/approve-cancel`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to approve cancellation';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  rejectCancelBooking: async (token: string, bookingId: number, reason: string): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/admin/bookings/${bookingId}/reject-cancel`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      let errorMessage = 'Failed to reject cancellation';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getDashboardDetails: async (token: string): Promise<DashboardDetailsResponse> => {
    const response = await authFetch(`${BASE_URL}/admin/dashboard/details`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch dashboard details';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getAdminBookings: async (token: string): Promise<AdminBooking[]> => {
    const response = await authFetch(`${BASE_URL}/admin/bookings`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch admin bookings';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getAvailableDrivers: async (token: string, startDate: string, endDate: string): Promise<AvailableDriver[]> => {
    const response = await authFetch(`${BASE_URL}/admin/drivers/available?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch available drivers';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  assignDriver: async (token: string, bookingId: number, driverId: string, driverName: string, driverPhone?: string): Promise<any> => {
    const payload: any = { driver_id: driverId, driver_name: driverName };
    if (driverPhone) {
      payload.driver_phone = driverPhone;
    }
    const response = await authFetch(`${BASE_URL}/admin/bookings/${bookingId}/assign-driver`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      let errorMessage = 'Failed to assign driver';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getAdminUsersDetails: async (token: string): Promise<AdminUserDetails[]> => {
    const response = await authFetch(`${BASE_URL}/admin/users/details`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch admin users details';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  blockUser: async (token: string, email: string, reason: string): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/admin/users/${encodeURIComponent(email)}/block`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      let errorMessage = 'Failed to block user';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getAdminCars: async (token: string): Promise<AdminCarOut[]> => {
    const response = await authFetch(`${BASE_URL}/admin/all/cars`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch admin cars';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  makeCarAvailable: async (token: string, car_number: string): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/admin/change-car-status/${encodeURIComponent(car_number)}/available`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to make car available';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  makeCarUnavailable: async (token: string, car_number: string): Promise<any> => {
    const response = await authFetch(`${BASE_URL}/admin/change-car-status/${encodeURIComponent(car_number)}/unavailable`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) {
      let errorMessage = 'Failed to make car unavailable';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  updateAdminCar: async (token: string, car_number: string, carData: any): Promise<AdminCarOut> => {
    const formData = new URLSearchParams();
    formData.append('brand', carData.brand);
    formData.append('model', carData.model);
    formData.append('year', carData.year.toString());
    formData.append('fuel_type', carData.fuel_type);
    formData.append('transmission', carData.transmission);
    formData.append('price_per_day', carData.price_per_day.toString());
    if (carData.price_per_km !== null && carData.price_per_km !== undefined) {
      formData.append('price_per_km', carData.price_per_km.toString());
    }
    formData.append('seats', carData.seats.toString());
    formData.append('location', carData.location);
    if (carData.description) {
      formData.append('description', carData.description);
    }
    formData.append('availability_type', carData.availability_type);
    formData.append('available', carData.available.toString());

    const response = await authFetch(`${BASE_URL}/admin/cars/${encodeURIComponent(car_number)}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: formData.toString()
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update car';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  createAdminCar: async (token: string, carData: any): Promise<AdminCarOut> => {
    const formData = new URLSearchParams();
    formData.append('car_number', carData.car_number);
    formData.append('brand', carData.brand);
    formData.append('model', carData.model);
    formData.append('year', carData.year.toString());
    formData.append('fuel_type', carData.fuel_type);
    formData.append('transmission', carData.transmission);
    formData.append('price_per_day', carData.price_per_day.toString());
    if (carData.price_per_km !== null && carData.price_per_km !== undefined) {
      formData.append('price_per_km', carData.price_per_km.toString());
    }
    formData.append('seats', carData.seats.toString());
    formData.append('location', carData.location);
    if (carData.description) {
      formData.append('description', carData.description);
    }
    formData.append('availability_type', carData.availability_type);
    formData.append('available', carData.available.toString());

    const response = await authFetch(`${BASE_URL}/admin/cars`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: formData.toString()
    });
    if (!response.ok) {
      let errorMessage = 'Failed to create car';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  // =====================
  // TICKETS API
  // =====================

  createTicket: async (token: string | null, payload: any): Promise<TicketOut> => {
    const headers: any = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      let errorMessage = 'Failed to create ticket';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getMyTickets: async (token: string): Promise<TicketOut[]> => {
    const response = await authFetch(`${BASE_URL}/tickets/my`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch my tickets');
    return response.json();
  },

  getAdminTickets: async (token: string): Promise<TicketOut[]> => {
    const response = await authFetch(`${BASE_URL}/tickets/admin`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch admin tickets');
    return response.json();
  },

  replyToTicket: async (token: string, ticketId: number, admin_reply: string, mark_resolved: boolean): Promise<TicketOut> => {
    const response = await authFetch(`${BASE_URL}/tickets/admin/${ticketId}/reply`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ admin_reply, mark_resolved })
    });
    if (!response.ok) {
      let errorMessage = 'Failed to reply to ticket';
      try { const err = await response.json(); errorMessage = err.detail || errorMessage; } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  // =====================
  // NOTIFICATIONS API
  // =====================

  getMyNotifications: async (token: string): Promise<NotificationItem[]> => {
    const response = await authFetch(`${BASE_URL}/notification`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) return [];
    return response.json();
  },

  getNotificationCount: async (token: string): Promise<number> => {
    const response = await authFetch(`${BASE_URL}/notification/count`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.unread_count ?? 0;
  },

  markNotificationRead: async (token: string, id: number): Promise<void> => {
    await authFetch(`${BASE_URL}/notification/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
  },

  markAllNotificationsRead: async (token: string): Promise<void> => {
    await authFetch(`${BASE_URL}/notification/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
  }
};
