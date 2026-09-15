export type Role = 'USER' | 'SELLER' | 'ADMIN';
export type CarStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'PAUSED';
export type Currency = 'USD' | 'TJS' | 'EUR' | 'RUB';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  is_blocked?: boolean;
  created_at?: string;
  last_login_at?: string | null;
}

export interface CarImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface Car {
  id: number;
  seller_id: number;
  brand_id: number;
  model_id: number;
  year: number;
  price_usd: number | string;
  mileage: number;
  engine?: string | null;
  power?: number | null;
  fuel: string;
  transmission: string;
  body: string;
  color?: string | null;
  vin?: string | null;
  location_id?: number | null;
  description?: string | null;
  phone?: string | null;
  status: CarStatus;
  is_featured: boolean;
  views: number;
  favorites_count: number;
  sold_at?: string | null;
  created_at: string;
  brand: string;
  model: string;
  country?: string | null;
  city?: string | null;
  location?: string | null;
  seller_name: string;
  seller_email?: string;
  seller_phone?: string | null;
  seller_avatar?: string | null;
  images: CarImage[] | null;
  is_favorite?: boolean;
  category?: string;
}

export interface Property {
  id: number;
  seller_id: number;
  title: string;
  kind: string;
  rooms: number;
  area_m2?: number | null;
  floor?: number | null;
  floors?: number | null;
  price_usd: number | string;
  location_id?: number | null;
  description?: string | null;
  phone?: string | null;
  status: string;
  is_featured: boolean;
  views: number;
  created_at: string;
  seller_name: string;
  seller_phone?: string | null;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  images: { id?: number; url: string; sort_order?: number }[] | null;
}

export interface Brand {
  id: number;
  name: string;
  logo?: string | null;
  models?: { id: number; name: string }[];
}

export interface Location {
  id: number;
  country: string;
  city: string;
}

export interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  car_id: number | null;
  other_name: string;
  other_avatar?: string | null;
  other_id: number;
  brand?: string;
  model?: string;
  car_year?: number;
  price_usd?: number;
  car_image?: string | null;
  last_message?: string | null;
  last_at?: string | null;
  unread: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string | null;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  is_read: boolean;
  related_id?: number | null;
  created_at: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const BRANDS = [
  'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Ferrari', 'Lamborghini',
  'Bentley', 'Rolls-Royce', 'Tesla', 'Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Nissan',
  'Honda', 'Hyundai', 'Kia', 'Volkswagen', 'Volvo', 'Subaru', 'Mazda', 'Mitsubishi',
  'Land Rover', 'Jaguar', 'BYD', 'Geely', 'Chery', 'Haval', 'Lada', 'MAN', 'DAF',
  'Scania', 'Isuzu', 'HOWO', 'Shacman', 'FAW', 'GAZ', 'KAMAZ', 'JCB', 'Caterpillar',
  'Komatsu', 'XCMG', 'John Deere', 'Yamaha', 'Kawasaki', 'Harley-Davidson', 'Ducati',
] as const;

export const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Gas'] as const;
export const TRANSMISSIONS = ['Automatic', 'Manual'] as const;
export const BODIES = [
  'Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Minivan', 'Sports', 'Pickup',
  'Truck', 'Heavy Truck', 'Bus', 'Coach', 'Tractor', 'Ambulance', 'Fire Truck',
  'Police', 'Commercial Van', 'Construction', 'Marine', 'Aircraft', 'Motorcycle',
  'Scooter', 'Bicycle',
] as const;
export const VEHICLE_CATEGORIES = [
  'passenger', 'commercial', 'kamaz', 'bus', 'special', 'agricultural',
  'motorcycle', 'marine', 'aircraft', 'parts',
] as const;
export const CURRENCIES: Currency[] = ['USD', 'TJS', 'EUR', 'RUB'];
