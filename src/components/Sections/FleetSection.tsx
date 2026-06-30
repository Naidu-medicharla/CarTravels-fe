import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Check, Users, Settings, Flame, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

import { getFallbackImage } from '@/lib/carImages';

interface DisplayCar {
  name: string;
  brand: string;
  price: string;
  dropPrice: string;
  bookingTypes: string[];
  img: string;
  badge?: string;
  transmission: string;
  fuelType: string;
  seats: number;
  location?: string;
  carNumber: string;
  available?: boolean;
}

const MOCK_CARS: DisplayCar[] = [
  {
    name: "Lexus RX 350", brand: "Lexus",
    price: "₹ 350", dropPrice: "₹ 15",
    bookingTypes: ['rental', 'drop'], img: "https://freepngimg.com/thumb/car/1-2-car-png-picture.png",
    transmission: "Auto", fuelType: "Petrol", seats: 4, location: "Hyderabad", carNumber: "AP09XX1234", available: true
  },
  {
    name: "Mercedes-Benz GLC", brand: "Mercedes-Benz",
    price: "₹ 200", dropPrice: "₹ 10",
    bookingTypes: ['rental'], img: "https://freepngimg.com/thumb/car/3-2-car-free-download-png.png",
    transmission: "Auto", fuelType: "Petrol", seats: 4, location: "Bangalore", carNumber: "AP09XX1234", available: true
  },
  {
    name: "Toyota Highlander", brand: "Toyota",
    price: "₹ 300", dropPrice: "₹ 12",
    bookingTypes: ['rental', 'drop'], img: "https://freepngimg.com/thumb/car/4-2-car-png-hd.png",
    transmission: "Auto", fuelType: "Petrol", seats: 5, location: "Chennai", carNumber: "AP09XX1234", available: false
  },
  {
    name: "Rolls-Royce Dawn", brand: "Rolls-Royce",
    price: "₹ 1,500", dropPrice: "₹ 50",
    bookingTypes: ['rental', 'drop'], img: "https://freepngimg.com/thumb/car/1-2-car-png-picture.png",
    transmission: "Auto", fuelType: "Petrol", seats: 4, location: "Hyderabad", carNumber: "AP09XX1234", available: true
  },
  {
    name: "Mercedes S Class", brand: "Mercedes",
    price: "₹ 400", dropPrice: "₹ 18",
    bookingTypes: ['rental'], img: "https://freepngimg.com/thumb/car/3-2-car-free-download-png.png",
    transmission: "Auto", fuelType: "Petrol", seats: 4, location: "Bangalore", carNumber: "AP09XX1234", available: true
  },
  {
    name: "Lamborghini Aventador", brand: "Lamborghini", badge: "🔥 Best Seller",
    price: "₹ 4,000", dropPrice: "₹ 100",
    bookingTypes: ['rental', 'drop'], img: "https://freepngimg.com/thumb/car/4-2-car-png-hd.png",
    transmission: "Auto", fuelType: "Petrol", seats: 2, location: "Hyderabad", carNumber: "AP09XX1234", available: true
  }
];

export const FleetSection: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'rental' | 'drop' | 'any'>('any');
  const [dbCars, setDbCars] = useState<DisplayCar[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        setLoading(true);
        api.getAllCars(token)
          .then(data => {
            const formatted: DisplayCar[] = data.map(c => ({
              name: `${c.brand} ${c.model}`,
              brand: c.brand,
              price: `₹ ${c.price_per_day}`,
              dropPrice: `₹ ${c.price_per_km}`,
              bookingTypes: c.availability_type === 'Both' ? ['rental', 'drop'] :
                c.availability_type === 'Rental' ? ['rental'] : ['drop'],
              img: c.images && c.images.length > 0 ? c.images[0] : getFallbackImage(c.brand, c.model),
              transmission: c.transmission,
              fuelType: c.fuel_type,
              seats: c.seats,
              location: c.location,
              carNumber: c.car_number,
              available: c.available
            }));
            setDbCars(formatted);
          })
          .catch(err => console.error("Failed to load cars", err))
          .finally(() => setLoading(false));
      }
    } else {
      setDbCars([]);
    }
  }, [isLoggedIn]);

  const displayCars = isLoggedIn ? dbCars : MOCK_CARS;

  const uniqueBrands = Array.from(new Set(displayCars.map(c => c.brand)));
  const uniqueLocations = Array.from(new Set(displayCars.map(c => c.location).filter(Boolean))) as string[];

  const filteredCars = displayCars.filter(car => {
    const typeMatch = activeTab === 'any' || car.bookingTypes.includes(activeTab);
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(car.brand);
    const locMatch = selectedLocations.length === 0 || (car.location && selectedLocations.includes(car.location));
    const priceValue = parseInt(car.price.replace(/[^0-9]/g, ''), 10) || 0;
    const priceMatch = priceValue <= maxPrice;
    const availMatch = !showOnlyAvailable || car.available;
    return typeMatch && brandMatch && locMatch && priceMatch && availMatch;
  });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-[#0B0B0C]">
      {/* Background Hero Image */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-black/50 via-[#0B0B0C]/80 to-[#0B0B0C] z-10" />
      <div
        className="absolute top-0 inset-x-0 h-[500px] bg-cover bg-center opacity-30 z-0"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000)' }}
      />

      <div className="container relative z-20 max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="lg:w-[230px] flex-shrink-0 space-y-8 sticky top-24 h-fit">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="text-primary" size={20} />
              <h3 className="text-white font-bold tracking-widest uppercase">Filters</h3>
            </div>

            {/* Rental Type */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rental type</h4>
              <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('any')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'any' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}>Any</button>
                <button
                  onClick={() => setActiveTab('rental')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'rental' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}>Per day</button>
                <button
                  onClick={() => setActiveTab('drop')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'drop' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}>Per drop</button>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Price (Per Day)</h4>
                <span className="text-sm font-bold text-primary transition-all">₹ {maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
                style={{
                  background: `linear-gradient(to right, #C6A87C ${(maxPrice / 20000) * 100}%, rgba(255,255,255,0.1) ${(maxPrice / 20000) * 100}%)`
                }}
              />
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #C6A87C;
                  cursor: pointer;
                  box-shadow: 0 0 10px rgba(198, 168, 124, 0.5);
                  transition: transform 0.1s;
                }
                input[type=range]::-webkit-slider-thumb:hover {
                  transform: scale(1.2);
                }
              `}</style>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Availability</h4>
              <label
                className="flex items-center gap-3 cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault(); // prevent default to avoid double-firing if label wraps input
                  setShowOnlyAvailable(!showOnlyAvailable);
                }}
              >
                <div className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors duration-300 ${showOnlyAvailable ? 'bg-primary' : 'bg-white/20'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 shadow-sm ${showOnlyAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">Show only available cars</span>
              </label>
            </div>

            {/* Location */}
            {uniqueLocations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</h4>
                <div className="flex flex-col gap-3">
                  {uniqueLocations.map(loc => (
                    <label key={loc} onClick={() => toggleLocation(loc)} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedLocations.includes(loc) ? 'bg-primary border-primary' : 'bg-transparent border-white/20 group-hover:border-primary/50'}`}>
                        {selectedLocations.includes(loc) && <Check size={12} className="text-black" />}
                      </div>
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-white/10" />

            {/* Car Brand */}
            {uniqueBrands.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Car Brand</h4>
                <div className="flex flex-col gap-3">
                  {uniqueBrands.map(brand => (
                    <label key={brand} onClick={() => toggleBrand(brand)} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-primary border-primary' : 'bg-transparent border-white/20 group-hover:border-primary/50'}`}>
                        {selectedBrands.includes(brand) && <Check size={12} className="text-black" />}
                      </div>
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Cars Content Area */}
          <div className="flex-1 min-h-[1000px]">
            {/* Header Layout */}
            <div className="mb-12">
              <h2 className="font-heading font-bold text-5xl text-white mb-4 tracking-wide uppercase">Our Fleet</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium luxury cars.<br />
                <span className="text-primary">★★★★★</span> Trusted by 12,000+ travelers
              </p>
            </div>

            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-white/10 pb-6">
              <span className="text-sm text-muted-foreground font-semibold">
                Showing {filteredCars.length} vehicles
              </span>
            </div>

            {/* Cars Grid / Loading State */}
            {loading ? (
              <div className="w-full flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-muted-foreground tracking-widest uppercase font-bold text-sm animate-pulse">Loading Fleet...</p>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-32 border border-white/5 rounded-2xl bg-white/[0.02]">
                <p className="text-muted-foreground tracking-widest uppercase font-bold">No vehicles match your criteria</p>
                <button
                  onClick={() => { setActiveTab('any'); setSelectedBrands([]); setSelectedLocations([]); }}
                  className="mt-6 px-6 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors rounded-xl font-bold tracking-wider uppercase text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                <AnimatePresence>
                  {filteredCars.map((car, i) => (
                    <motion.div
                      key={car.name + i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="group flex flex-col relative bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.55)] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                    >
                      {car.badge && (
                        <div className="absolute top-0 right-6 px-3 py-1.5 bg-gradient-to-r from-primary to-yellow-600 text-black text-[10px] font-extrabold tracking-widest uppercase z-10 translate-y-[-50%] rounded shadow-lg">
                          {car.badge}
                        </div>
                      )}

                      {/* Car Image */}
                      <div className="h-56 w-full mb-8 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]">
                        <img src={car.img} alt={car.name} className="max-h-full object-contain filter drop-shadow-2xl" />
                      </div>

                      {/* Details */}
                      <div className="flex flex-col flex-1 w-full text-left">
                        <h3 className="font-sans font-bold text-white text-xl leading-tight mb-2">{car.name}</h3>

                        {/* Icons row */}
                        <div className="flex items-center justify-start gap-4 text-xs text-muted-foreground font-medium mb-6">
                          <span className="flex items-center gap-1.5"><Settings size={14} /> {car.transmission}</span>
                          <span className="flex items-center gap-1.5"><Flame size={14} /> {car.fuelType}</span>
                          <span className="flex items-center gap-1.5"><Users size={14} /> {car.seats} seats</span>
                        </div>

                        {car.location && (
                          <div className="flex items-center gap-1.5 text-xs text-primary mb-4 opacity-80">
                            <MapPin size={12} /> {car.location}
                          </div>
                        )}

                        <div className="mt-auto w-full pt-5 border-t border-white/5 flex items-center justify-between gap-1">
                          <div className="flex items-baseline whitespace-nowrap">
                            <span className="text-white font-sans font-bold text-2xl transition-colors">
                              {activeTab === 'drop' ? car.dropPrice : car.price}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground ml-1 flex-shrink-0">/{activeTab === 'drop' ? 'km' : 'day'}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const type = activeTab === 'drop' ? 'drop' : 'rental';
                              if (isLoggedIn) {
                                navigate(`/book?type=${type}&car=${car.carNumber}`);
                              } else {
                                navigate(`/login?redirect=/book?type=${type}&car=${car.carNumber}`);
                              }
                            }}
                            className="px-4 py-2 flex-shrink-0 border border-white/20 hover:border-white text-white hover:bg-white/5 transition-all duration-300 rounded-xl text-sm font-bold tracking-wider uppercase whitespace-nowrap"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
