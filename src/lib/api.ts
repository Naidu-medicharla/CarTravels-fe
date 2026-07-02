const BASE_URL = 'https://deep-clouds-allow.loca.lt';

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
    return response.json();
  },

  getDashboardDetails: async (token: string): Promise<DashboardDetailsResponse> => {
    const response = await authFetch(`${BASE_URL}/dashboard/details`, {
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
  }
};
