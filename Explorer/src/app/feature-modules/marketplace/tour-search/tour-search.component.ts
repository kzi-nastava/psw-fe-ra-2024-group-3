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
  searchCriteria: SearchByDistance = {
    distance: 0,
    latitude: 0, 
    longitude: 0 
  };

  constructor(private service: MarketplaceService, private router: Router) { }

  searchTours(): void {
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
  
}
