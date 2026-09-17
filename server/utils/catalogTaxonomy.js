/**
 * Global vehicle marketplace taxonomy.
 * `category` = marketplace section (DB column).
 * `body` = vehicle body / type shown on cards & filters.
 */

export const MARKET_CATEGORIES = [
  'passenger',
  'commercial',
  'kamaz',
  'bus',
  'special',
  'agricultural',
  'motorcycle',
  'marine',
  'aircraft',
  'parts',
];

/** Group filter aliases used in UI query params. */
export const CATEGORY_ALIASES = {
  heavy: ['commercial', 'kamaz', 'bus', 'special', 'agricultural'],
  electric: null, // handled via fuel
  hybrid: null,
};

export const BODY_TYPES = [
  'Sedan',
  'SUV',
  'Coupe',
  'Hatchback',
  'Wagon',
  'Minivan',
  'Sports',
  'Pickup',
  'Truck',
  'Heavy Truck',
  'Bus',
  'Coach',
  'Tractor',
  'Ambulance',
  'Fire Truck',
  'Police',
  'Commercial Van',
  'Construction',
  'Marine',
  'Aircraft',
  'Motorcycle',
  'Scooter',
  'Bicycle',
];

export const WORLD_BRANDS = [
  'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Ferrari', 'Lamborghini',
  'Bentley', 'Rolls-Royce', 'Tesla', 'Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Nissan',
  'Honda', 'Hyundai', 'Kia', 'Volkswagen', 'Volvo', 'Subaru', 'Mazda', 'Mitsubishi',
  'Land Rover', 'Jaguar', 'BYD', 'Geely', 'Chery', 'Haval', 'Lada', 'Daewoo',
  'MAN', 'DAF', 'Scania', 'Isuzu', 'HOWO', 'Shacman', 'FAW', 'GAZ', 'KAMAZ',
  'JCB', 'Caterpillar', 'Komatsu', 'XCMG', 'John Deere', 'Yamaha', 'Kawasaki',
  'Harley-Davidson', 'Ducati', 'Boeing', 'Airbus', 'Yamaha Marine', 'BRP',
];

/** Brands that must never appear under passenger / "buy cars". */
export const HEAVY_BRANDS = [
  'MAN', 'DAF', 'Scania', 'Isuzu', 'HOWO', 'Shacman', 'FAW', 'KAMAZ', 'MAZ', 'Dongfeng', 'Iveco',
  'JCB', 'Caterpillar', 'Komatsu', 'XCMG', 'Liebherr', 'Hitachi', 'John Deere', 'MTZ', 'New Holland', 'Case IH', 'Claas',
  'PAZ', 'LiAZ', 'Yutong', 'King Long',
];

/** GAZ passenger vans stay commercial when body is bus/van; brand alone is ambiguous. */
export const BUS_BRANDS = ['PAZ', 'LiAZ', 'Yutong', 'King Long'];

export function resolveCategoryFilter(category) {
  if (!category) return null;
  if (category === 'heavy') return CATEGORY_ALIASES.heavy;
  if (MARKET_CATEGORIES.includes(category)) return [category];
  return [category];
}
