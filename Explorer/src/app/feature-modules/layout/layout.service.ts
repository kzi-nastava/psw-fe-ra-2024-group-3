import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProfile } from './model/user-profile.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/env/environment';
import { UserRating } from './model/user-rating.model';
import { Person } from 'src/app/infrastructure/auth/model/person.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Notification } from 'src/app/feature-modules/layout/model/notification.model';
import { Achievement } from '../administration/model/achievement.model';
import { ErrorHandlerService } from 'src/app/shared/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }


  getProfile(role: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiHost}${role}/profile/`).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  updateProfile(userProfile: UserProfile, role: string): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${environment.apiHost}${role}/profile/`, userProfile).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }
  submitRating(rating: UserRating, role: string): Observable<UserRating> {
    return this.http.post<UserRating>(environment.apiHost + role + "/ratings", rating).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getRatings(): Observable<Array<UserRating>> {
    return this.http.get<Array<UserRating>>(environment.apiHost + 'administrator/ratings').pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getPersonByUserId(userId: string): Observable<Person> {
    return this.http.get<Person>(environment.apiHost + `administrator/users/${userId}/person`).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getTouristNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(environment.apiHost + `tourist/notification/getUnread?touristId=${userId}`).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  getAuthorNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(environment.apiHost + `author/notification/getUnread?authorId=${userId}`).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  markAsReadAuthor(notification: Notification): Observable<Notification> {
    return this.http.put<Notification>(environment.apiHost + `author/notification/setSeen`, notification).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  markAsReadTourist(notification: Notification): Observable<Notification> {
    return this.http.put<Notification>(environment.apiHost + `tourist/notification/setSeen`, notification).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  deleteNotificationAuthor(notification: Notification): Observable<Notification> {
    return this.http.put<Notification>(environment.apiHost + `author/notification/delete`, notification).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }

  deleteNotificationTourist(notification: Notification): Observable<Notification> {
    return this.http.put<Notification>(environment.apiHost + `tourist/notification/delete`, notification).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
        return throwError(() => error);
      })
    );
  }
}
