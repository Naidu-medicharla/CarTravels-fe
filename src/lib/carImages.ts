import imgHondaCity from '@/assets/cars/honda_city_color.png';
import imgHondaCivic from '@/assets/cars/honda_civic_color.png';
import imgHyundaiCreta from '@/assets/cars/hyndai_creta.png';
import imgToyotaInnova from '@/assets/cars/toyota_inova_crysta.png';
import imgMahindraXUV from '@/assets/cars/mahindra_xuv700.png';
import imgToyotaFortuner from '@/assets/cars/Toyota_Fortuner.png';
import imgMarutiErtiga from '@/assets/cars/Maruti_Suzuki_Ertiga.png';
import imgKiaCarens from '@/assets/cars/Kia_Carens.png';

export const localCarImages: Record<string, string> = {
  "honda city": imgHondaCity,
  "honda civic": imgHondaCivic,
  "hyundai creta": imgHyundaiCreta,
  "mahindra xuv700": imgMahindraXUV,
  "mahindra xuv": imgMahindraXUV,
  "toyota innova": imgToyotaInnova,
  "toyota innova crysta": imgToyotaInnova,
  "toyota fortuner": imgToyotaFortuner,
  "maruti suzuki ertiga": imgMarutiErtiga,
  "ertiga": imgMarutiErtiga,
  "kia carens": imgKiaCarens,
};

export const getFallbackImage = (brand: string, model: string) => {
  const name = `${brand} ${model}`.trim().toLowerCase();

  // Check if we have an exact local asset mapping
  for (const [key, img] of Object.entries(localCarImages)) {
    if (name.includes(key)) return img;
  }

  // Otherwise, use a deterministic generic fallback
  const defaultImages = [
    "https://freepngimg.com/thumb/car/1-2-car-png-picture.png", // Silver BMW
    "https://freepngimg.com/thumb/car/3-2-car-free-download-png.png", // Grey Merc
    "https://freepngimg.com/thumb/car/4-2-car-png-hd.png", // Yellow Lambo
    "https://freepngimg.com/thumb/car/5-2-car-png-file.png", // White sports car
    "https://freepngimg.com/thumb/car/6-2-car-png-image.png", // Red SUV
    "https://freepngimg.com/thumb/car/7-2-car-png-hd.png", // Black luxury
    "https://freepngimg.com/thumb/car/8-2-car-png.png" // Silver Sedan
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return defaultImages[Math.abs(hash) % defaultImages.length];
};
