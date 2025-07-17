import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Clubs } from './model/clubs.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TourEquipment } from './model/tourEquipment.model';
import { Object } from './model/object.model';
import { Tour } from './model/tour.model';
import { environment } from 'src/env/environment';
import { TransportInfo, TransportType } from './model/transportInfo.model';
import { Tourist } from './model/tourist.model';
import { KeyPoint } from './model/key-point.model';
import { GroupTour } from './model/group-tour.model';
import { GroupTourExecution } from '../tour-shopping/model/group-tour-exectuion.model';
import { ErrorHandlerService } from 'src/app/shared/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TourAuthoringService {


  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  getClubs(): Observable<PagedResults<Clubs>> {
    return this.http.get<PagedResults<Clubs>>('https://localhost:44333/api/administration/club').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  addClub(club: Clubs): Observable<Clubs> {
    return this.http.post<Clubs>(environment.apiHost + 'administration/club', club).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  deleteClub(id: number): Observable<Clubs> {
    return this.http.delete<Clubs>(environment.apiHost + 'administration/club/' + id).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  joinClub(clubId: number): Observable<Clubs> {
    return this.http.post<Clubs>(`${environment.apiHost}administration/club/${clubId}/request`, {}).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  acceptRequest(clubId: number, userId: number): Observable<Clubs> {
    return this.http.post<Clubs>(`${environment.apiHost}administration/club/${clubId}/acceptRequest`, userId).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  denyRequest(clubId: number, userId: number): Observable<Clubs> {
    return this.http.post<Clubs>(`${environment.apiHost}administration/club/${clubId}/denyRequest`, userId).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  updateClub(club: Clubs): Observable<Clubs> {
    return this.http.put<Clubs>(environment.apiHost + 'administration/club/' + club.id, club).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getObject(): Observable<PagedResults<Object>> {
    return this.http.get<PagedResults<Object>>('https://localhost:44333/api/author/object').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }


  addObject(object: Object): Observable<Object> {
    object.category = Number(object.category)
    console.log(object)
    return this.http.post<Object>('https://localhost:44333/api/author/object', object).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }


  getTours(): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(environment.apiHost + 'administration/tour').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getToursByAuthorId(authorId: number, page: number = 1, pageSize: number = 10): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(`${environment.apiHost}administration/tour/by-author`, {
      params: {
        id: authorId.toString(),
        page: page.toString(),
        pageSize: pageSize.toString()
      }
    }).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getToursByAuthorIdAsTourist(authorId: number, page: number = 1, pageSize: number = 100): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(`${environment.apiHost}tourist/tour/by-author`, {
      params: {
        id: authorId.toString(),
        page: page.toString(),
        pageSize: pageSize.toString()
      }
    }).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  publishTour(tour: Tour): Observable<Tour> {
    console.log(tour);
    return this.http.post<Tour>(environment.apiHost + 'administration/tour/publish-tour', tour).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  archiveTour(tour: Tour): Observable<Tour> {
    console.log(tour);
    return this.http.put<Tour>(environment.apiHost + 'administration/tour/archive-tour', tour).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  addTour(tour: Tour): Observable<Tour> {
    console.log('Sending tour data to API:', tour);
    return this.http.post<Tour>(environment.apiHost + 'administration/tour', tour).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getTourEquipment(tourId: number): Observable<TourEquipment[]> {
    return this.http.get<TourEquipment[]>(environment.apiHost + 'tourEquipment/byTourId', {
      params: {
        tourId: tourId.toString(),
        page: "1",
        pageSize: "10"
      }
    }).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getAllTourEquipments(): Observable<TourEquipment[]> {
    return this.http.get<TourEquipment[]>(environment.apiHost + 'tourEquipment/allTourEquipments', {
      params: {
        page: "1",
        pageSize: "10"
      }
    }).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  deleteTourEquipment(id: number): Observable<TourEquipment> {
    return this.http.delete<TourEquipment>(environment.apiHost + 'tourEquipment/' + id).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  addTourEquipment(tourEquipment: TourEquipment): Observable<TourEquipment> {
    return this.http.post<TourEquipment>(environment.apiHost + 'tourEquipment', tourEquipment).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }
  getAllTours(): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(environment.apiHost + 'administrator/tour/allTours').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }
  getTouristTours(): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(environment.apiHost + 'tourist/tour/all').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }
  getKeyPointsByTourId(tourId: number): Observable<Tour> {
    return this.http.get<Tour>(`${environment.apiHost}administration/tour/${tourId}/key-points`).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }
  
  updateTour(tour: Tour): Observable<Tour> {
    return this.http.put<Tour>(`${environment.apiHost}administration/tour/${tour.id}`, tour).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  updateGroupTour(tour: GroupTour): Observable<GroupTour> {
    return this.http.put<GroupTour>(`${environment.apiHost}administration/tour/group/${tour.id}`, tour);
  }
  
  cancelGroupTour(tour: GroupTour): Observable<GroupTour> {
    return this.http.put<GroupTour>(`${environment.apiHost}administration/tour/group/cancel/${tour.id}`, tour);
  }
  
  calculateDistance(latlngs: [number, number][]): number {
    let totalDistance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
      const point1 = latlngs[i];
      const point2 = latlngs[i + 1];
      const segmentDistance = this.getDistanceBetweenPoints(point1, point2);
      console.log(`Udaljenost između ${point1} i ${point2} je: ${segmentDistance} km`);
      totalDistance += segmentDistance;
    }
    console.log(`Ukupna udaljenost: ${totalDistance} km`);
    return totalDistance;
  }

  calculateTime(distance: number, transportType: TransportType): number {
    let speed;

    switch (transportType) {
      case TransportType.Car:
        speed = 60;
        break;
      case TransportType.Walk:
        speed = 5;
        break;
      case TransportType.Bicycle:
        speed = 15;
        break;
      default:
        throw new Error('Nepoznat tip transporta');
    }

    return distance / speed * 60;
  }

  private getDistanceBetweenPoints(point1: [number, number], point2: [number, number]): number {
    const R = 6371;
    const dLat = this.toRad(point2[0] - point1[0]);
    const dLon = this.toRad(point2[1] - point1[1]);

    const lat1 = this.toRad(point1[0]);
    const lat2 = this.toRad(point2[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  updateTransportInfo(tourId: number, transportInfo: TransportInfo): Observable<void> {
    return this.http.put<void>(`${environment.apiHost}administration/tour/${tourId}/transport-info`, transportInfo).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getTourists(): Observable<Tourist[]> {
    return this.http.get<Tourist[]>(environment.apiHost + 'user/tourist/getTourists').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  // Invite a user to the club
  inviteUser(clubId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}administration/club/${clubId}/invite`, userId).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  // Accept an invitation
  acceptInvitation(clubId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}administration/club/${clubId}/accept`, {}).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  // Reject an invitation
  rejectInvitation(clubId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}administration/club/${clubId}/reject`, {}).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  removeMember(clubId: number, memberId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiHost}administration/club/${clubId}/remove`, memberId).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getInvitations(): Observable<PagedResults<Clubs>> {
    return this.http.get<PagedResults<Clubs>>(`${environment.apiHost}administration/club/invitations`).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }


  getKeyPointById(id: number): Observable<KeyPoint> {
    return this.http.get<KeyPoint>(environment.apiHost + 'administrator/keyPoint?id=' + id).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getObjectById(id: number): Observable<Object> {
    return this.http.get<Object>('https://localhost:44333/by?id=' + id).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  addGroupTour(groupTour: GroupTour): Observable<GroupTour> {
    const url = `${environment.apiHost}group-tour`; 
    return this.http.post<GroupTour>(environment.apiHost + 'administration/tour/group-tour', groupTour);
  }

  getAllGroupTours(): Observable<PagedResults<GroupTour>> {
    return this.http.get<PagedResults<GroupTour>>(environment.apiHost + 'administration/tour/group-tours')
  }

  getRegularTours(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiHost}/regular`);
  }

  getAllGroupTourExecutions(): Observable<PagedResults<GroupTourExecution>> {
    return this.http.get<PagedResults<GroupTourExecution>>(environment.apiHost + 'author/groupTourExecution')
  }

  getUserProfileById(userId: number): Observable<Tourist> {
    console.log(`Poziva se API za userId: ${userId}`);
    return this.http.get<Tourist>(`${environment.apiHost}author/profile/${userId}`);
  }
}
