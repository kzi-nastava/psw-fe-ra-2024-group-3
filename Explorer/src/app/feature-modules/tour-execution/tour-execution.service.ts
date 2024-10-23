import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResult } from 'src/app/shared/shared.module';
import { TouristEquipment } from './model/tourist-equipment.model';
import { Observable } from 'rxjs';
import { Equipment } from '../administration/model/equipment.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { Problem } from './model/problem.model';
import { TourReview } from './model/tour-review.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { TourPreferences } from 'src/app/shared/model/tour-preferences.model';


@Injectable({
  providedIn: 'root'
})
export class TourExecutionService {


  constructor(private http: HttpClient) { }

  getTouristEquipment(touristId: number): Observable<TouristEquipment[]>{

     // Dodaj odgovarajući token
    
    return this.http.get<TouristEquipment[]>('https://localhost:44333/api/tourist/touristEquipment/byTouristId', {
      params: {
        touristId: touristId.toString() // Pretvorite brojeve u stringove jer query parametri moraju biti stringovi
       
      }
    });
  }

  

  getEquipment(): Observable<PagedResult<Equipment>>{

    // Dodaj odgovarajući token
   
   return this.http.get<PagedResult<Equipment>>('https://localhost:44333/api/tourist/touristEquipment');
 }

 getAllEquipment(): Observable<PagedResult<TouristEquipment>>{

  // Dodaj odgovarajući token
 
 return this.http.get<PagedResult<TouristEquipment>>('https://localhost:44333/api/tourist/touristEquipment/all');
}

 delete(touristEquipment: TouristEquipment): Observable<TouristEquipment>{

  // Dodaj odgovarajući token
 
 return this.http.delete<TouristEquipment>('https://localhost:44333/api/tourist/touristEquipment/'+ touristEquipment.id);
}

add(touristEquipment: TouristEquipment): Observable<TouristEquipment>{

  // Dodaj odgovarajući token
 
 return this.http.post<TouristEquipment>('https://localhost:44333/api/tourist/touristEquipment', touristEquipment);
}

  constructor(private http : HttpClient) { }
  
  reportProblem(problem : Problem): Observable<Problem>{
    return this.http.post<Problem>(' https://localhost:44333/api/tourist/problem/report', problem)
  }
  getProblems(): Observable<PagedResults<Problem>> {
    return this.http.get<PagedResults<Problem>>('https://localhost:44333/api/tourist/problem/all')
  }

  getReviews(): Observable<PagedResults<TourReview>> {
    return this.http.get<PagedResults<TourReview>>('https://localhost:44333/api/tourist/review')
  }


  addTourReview(tourReview : TourReview): Observable<PagedResults<TourReview>> {
    console.log(tourReview);
    return this.http.post<PagedResults<TourReview>>('https://localhost:44333/api/tourist/review',tourReview)
  }
  getTourPreferencesByTouristId(touristId : number) : Observable<TourPreferences> {
    return this.http.get<TourPreferences>(environment.apiHost + `tourist/tourPreferences/GetByTouristId?id=${touristId}`);
  }

  addTourPreferences(tourPreferences: TourPreferences) : Observable<TourPreferences> {
    return this.http.post<TourPreferences>(environment.apiHost + 'tourist/tourPreferences', tourPreferences);
  }

  updateTourPreferences(tourPreferences: TourPreferences) : Observable<TourPreferences> {
    return this.http.put<TourPreferences>(environment.apiHost + `tourist/tourPreferences/${tourPreferences.id}`, tourPreferences);
  }
}
