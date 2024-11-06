import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeyPointService } from '../../key-point.service'; 
import { KeyPoint } from '../../model/key-point.model';

@Component({
  selector: 'xp-key-point',
  templateUrl: './key-point.component.html',
  styleUrls: ['./key-point.component.css']
})
export class KeyPointComponent implements OnInit {
  tourId: number;
  keyPoints: KeyPoint[] = [];
  newKeyPoint: KeyPoint; 
  lastKeyPoint: KeyPoint;
  totalDistance: number = 0;

  constructor(private route: ActivatedRoute, private keyPointService: KeyPointService) { }

  ngOnInit(): void {
    this.tourId = Number(this.route.snapshot.paramMap.get('tourId')); // Uzimanje tourId iz URL-a
    this.newKeyPoint = { tourId: this.tourId, name: '', description: '', imagePath: '', longitude:0, latitude:0 }; // Inicijalizacija newKeyPoint
    this.loadKeyPoints(); // Poziv funkcije za učitavanje ključnih tačaka
  }

  loadKeyPoints() {
    this.keyPointService.getKeyPoints().subscribe(keyPoints => {
      console.log('Vraćeni keyPoints:', keyPoints); 
      this.keyPoints = keyPoints.filter(kp => kp.tourId === this.tourId); // Filtriranje po tourId
      console.log('Filtrirane ključne tačke: ', this.keyPoints); 

      // Uzimanje poslednje ključne tačke
      if (this.keyPoints.length > 0) {
        this.lastKeyPoint = this.keyPoints[this.keyPoints.length - 1]; // Uzmi poslednju ključnu tačku

       
        this.totalDistance = this.calculateTotalDistance();
      }
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Zemljina poluosa u kilometrima
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Udaljenost u kilometrima
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  calculateTotalDistance(): number {
    let total = 0;
    for (let i = 1; i < this.keyPoints.length; i++) {
      total += this.calculateDistance(
        this.keyPoints[i - 1].latitude,
        this.keyPoints[i - 1].longitude,
        this.keyPoints[i].latitude,
        this.keyPoints[i].longitude
      );
    }
    return total; 
  }


  onAddKeyPoint() {
   
   this.loadKeyPoints()
    this.newKeyPoint.tourId = this.tourId;
    this.keyPointService.addKeyPoint(this.newKeyPoint).subscribe({
      next: (keyPoint) => {
        this.keyPoints.push(keyPoint);
        if (this.lastKeyPoint) {
          console.log('Poslednja ključna tačka:', this.lastKeyPoint); 
          const distance = this.calculateDistance(this.lastKeyPoint.latitude, this.lastKeyPoint.longitude, this.newKeyPoint.latitude, this.newKeyPoint.longitude);
          console.log(`Udaljenost između poslednje tačke i nove tačke je: ${distance} km`);
    
          this.totalDistance += distance;
          console.log(`Nova ukupna dužina ture je: ${this.totalDistance} km`);
        }
        this.newKeyPoint = { tourId: this.tourId, name: '', description: '', imagePath: '', latitude: 0, longitude: 0 }; // Reset forme
      },
      error: (error) => {
        console.error("Greška prilikom dodavanja ključne tačke: ", error); 
        console.error("Detaljne greške: ", error.error.errors); 
      }
      
    });
    
  }
  
}
