import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './map.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  @Input() keyPoints: any[] = [];
  @Input() initialCenter: [number, number] = [45.2396, 19.8227];
  @Input() initialZoom: number = 13;
  @Input() markers: any[] = [];
  @Input() creatingKeyPoint = false;
  @Output() keyPointSelected = new EventEmitter<{ latitude: number, longitude: number }>();
  @Output() markerAdded = new EventEmitter<{ latitude: number, longitude: number }>();
  private map: any;
  searchQuery: string = '';
  address:string='';

  constructor(private service: MapService) { }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.initialCenter,
      zoom: this.initialZoom,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    tiles.addTo(this.map);
    if (this.markers.length > 0) {
      this.markers.forEach(marker => {
        L.marker([marker.latitude, marker.longitude]).addTo(this.map);
      });
    }
    this.registerOnClick();
  }

  setRoute(waypoints: Array<{ lat: number, lng: number }>, profile: 'walking' | 'driving' | 'cycling'): void {
    const routeControl = L.Routing.control({
      waypoints: waypoints.map(point => L.latLng(point.lat, point.lng)),
      router: L.routing.mapbox('pk.eyJ1IjoiZGp1cmRqZXZpY20iLCJhIjoiY20yaHVzOTgyMGJwbzJqczNteW1xMm0yayJ9.woKtBh92sOV__L25KcUu_Q', { profile: `mapbox/${profile}` })
    }).addTo(this.map);

    routeControl.on('routesfound', function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      alert('Total distance is ' + (summary.totalDistance / 1000).toFixed(2) + ' km and total time is ' + Math.round(summary.totalTime % 3600 / 60) + ' minutes');
    });
  }


  ngAfterViewInit(): void {
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
    });

    L.Marker.prototype.options.icon = DefaultIcon;
    this.initMap();
    if (this.creatingKeyPoint) {
      this.setCurrentLocation();
    }
  }

  private setCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Postavljanje trenutne lokacije kao centar mape
        this.map.setView([latitude, longitude], this.initialZoom);

        // Dodavanje markera na trenutnu lokaciju
        const mp = new L.Marker([latitude, longitude]).addTo(this.map)
          .bindPopup('You are here!')
          .openPopup();
        this.markers.push(mp)
        this.keyPointSelected.emit({ latitude: latitude, longitude: longitude });
        this.service.reverseSearch(latitude, longitude).subscribe((response) => {
          this.address = response.display_name; // Dobijena adresa
          console.log('Dobijena adresa:', this.address);
        });
        // Emitovanje trenutnih koordinata
        this.markerAdded.emit({ latitude, longitude });
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  search(): void {
    this.service.search(this.searchQuery).subscribe({
      next: (result) => {
        if (result.length > 0) {
          const lat = result[0].lat;
          const lon = result[0].lon;

          if (this.creatingKeyPoint) {
            this.clearMarkers();
          }
          this.keyPointSelected.emit({ latitude: lat, longitude: lon });
          this.map.setView([lat, lon], 15);
          const mp = new L.Marker([lat, lon])
            .addTo(this.map)
            .bindPopup(this.searchQuery)
            .openPopup();
          this.markers.push(mp)
          this.service.reverseSearch(lat, lon).subscribe((response) => {
            this.address = response.display_name; // Dobijena adresa
            console.log('Dobijena adresa:', this.address);
          });
        } else {
          alert('Location not found.');
        }
      },
      error: (err) => {
        console.error('Search error: ', err);
      },
    });
  }

  registerOnClick(): void {
    this.map.on('click', (e: any) => {
      const coord = e.latlng;
      const lat = coord.lat;
      const lng = coord.lng;
      if (this.creatingKeyPoint) {
        this.clearMarkers();
      }
      this.keyPointSelected.emit({ latitude: lat, longitude: lng });
      this.service.reverseSearch(lat, lng).subscribe((res) => {
        console.log(res.display_name);
      });
      const mp = new L.Marker([lat, lng]).addTo(this.map);
      this.markers.push(mp);
      this.service.reverseSearch(lat, lng).subscribe((response) => {
        this.address = response.display_name; // Dobijena adresa
        console.log('Dobijena adresa:', this.address);
      });
      this.markerAdded.emit({ latitude: lat, longitude: lng }); // Emit the added marker
    });
  }

  clearMarkers(): void {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

}
