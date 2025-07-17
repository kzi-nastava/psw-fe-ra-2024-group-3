import { Component } from '@angular/core';
import { SearchByDistance } from '../model/search-by-distance.model';
import { MarketplaceService } from '../marketplace.service';
import { KeyPoint } from '../../tour-authoring/model/key-point.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-tour-search',
  templateUrl: './tour-search.component.html',
  styleUrls: ['./tour-search.component.css']
})
export class TourSearchComponent {

  searchedTours: Tour[] = [];
  noToursFound: boolean = false;
  isSearchModalOpen = false;
  searchCriteria: SearchByDistance = {
    maxDistance: 0,
    minDistance: 0,
    distance: 0, // Dodano za maksimalnu udaljenost od odabrane lokacije
      latitude: 0, 
      longitude: 0,
      keyPointName: '',
      maxRating: 0,
      minRating: 0,
      maxPrice: 0,
      minPrice: 0,
      maxDuration: 0,
      minDuration: 0,
      name: '',
      tags: '',
  };

  constructor(private service: MarketplaceService, private router: Router) { }

  searchTours(): void {
    this.isSearchModalOpen = true;
    // Resetuj `noToursFound` pre svake pretrage
    this.noToursFound = false;

    // Izvrši pretragu
    this.service.searchTours(this.searchCriteria).subscribe((response) => {
      this.searchedTours = response;

      // Postavi `noToursFound` na `true` ako nema rezultata
      this.noToursFound = this.searchedTours.length === 0;
    });
  }

  onKeyPointSelected(event: { latitude: number, longitude: number }): void {
    this.searchCriteria.latitude = event.latitude;
    this.searchCriteria.longitude = event.longitude;
    console.log('Odabrana tačka za pretragu:', this.searchCriteria.latitude, this.searchCriteria.longitude);
  }

  onTourClick(tourId: number | undefined): void {
    if (tourId !== undefined) {
      this.router.navigate(['/explore-tours'], { queryParams: { selectedTourId: tourId } });
    } else {
      console.error('Tour ID is undefined');
    }
  }

  getDifficultyLabel(difficulty: number): string {
    switch (difficulty) {
        case 0:
            return 'Easy';
        case 1:
            return 'Medium';
        case 2:
            return 'Hard';
        default:
            return 'Unknown';
    }
}

  closeSearchModal(): void {
    this.isSearchModalOpen = false;
}

}
