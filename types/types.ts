export type User = {
  id: string;
  email: string;
  user_type: 'owner' | 'user';
  full_name?: string;
  phone_number?: string;
  created_at: string;
  updated_at?: string;
};

export type Office = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  price_per_hour: number;
  price_per_day: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  booking_count: number;
  created_at: string;
};

export type Booking = {
  id: string;
  office_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  office?: Office; 
  user?: User;
};

export type OwnerBooking = Booking & {
  office: Office;
  user: User;
};