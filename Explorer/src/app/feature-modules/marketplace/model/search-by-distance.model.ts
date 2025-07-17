export interface SearchByDistance {
    distance: number; // Dodano za maksimalnu udaljenost od odabrane lokacije
    minDistance: number;
    maxDistance: number;
    longitude: number; 
    latitude: number; 
    tags: string;
    keyPointName: string;
    maxRating: number;
    minRating: number;
    maxPrice: number;
    minPrice: number;
    maxDuration: number;
    minDuration: number;
    name: string;
  }