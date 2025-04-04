import { Component } from '@angular/core';
import { TourShoppingService } from '../tour-shopping.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { Location } from 'src/app/feature-modules/tour-execution/model/location.model';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';

@Component({
  selector: 'xp-purchased-tours',
  templateUrl: './purchased-tours.component.html',
  styleUrls: ['./purchased-tours.component.css']
})
export class PurchasedToursComponent {

  user: User;
  tours: Tour[] = [];
  selectedTourKeyPoints: any[] = []; // Holds key points for the selected tour
  isKeyPointsModalOpen = false; // Tracks whether the modal is open
  isLoading = false;
  tourId: number;
  location: Location = { latitude: 0, longitude: 0 };
  tourStarted: boolean = false;

  constructor(private service: TourShoppingService, private notificationService: NotificationService, private router: Router, private authService: AuthService, private tourExecutionService: TourExecutionService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.loadPurchasedTours();
    });
  }

  private loadPurchasedTours(): void {
    this.isLoading = true;
    if (this.user?.role == 'tourist') {
      this.service.getPurchasedTours().subscribe({
        next: (tours: Tour[]) => {
          this.tours = tours;
          console.log(this.tours)
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Failed to load purchased tours:', err);
          this.notificationService.notify({ message: 'Failed to load purchased tours', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });
    }
  }

  executeTour(tour: Tour) {
    console.log(`Executing tour: ${tour.name}`);
  }

  canReview(tourId: number): boolean {
    return true;
  }

  reviewTour(tourId: number, tourName: string) {
    this.router.navigate(['/review', tourId, tourName]);
  }


  showKeyPoints(tour: Tour): void {
    if (tour.id !== undefined) { // Check if tour.id is defined
      this.service.getKeyPoints().subscribe(keyPoints => {
        this.selectedTourKeyPoints = keyPoints.filter(kp => kp.tourIds.includes(tour.id!)); // Use tour.id safely
        this.isKeyPointsModalOpen = true; // Open the modal
      });
    } else {
      console.error('Tour ID is undefined');
      this.notificationService.notify({ message: 'Tour ID is undefined', duration: 3000, notificationType: NotificationType.WARNING });
    }
  }
  closeKeyPointsModal(): void {
    this.isKeyPointsModalOpen = false; // Close the modal
    this.selectedTourKeyPoints = []; // Clear key points data
  }



  onStartTourSession(tourId: number): void {
    if (tourId) {
      this.tourExecutionService.getTouristLocation().subscribe({
        next: (data) => {
          this.location.latitude = data.latitude
          this.location.longitude = data.longitude
          console.log("Turista se nalazi na lokaciji: long" + this.location.longitude + " lat: " + this.location.latitude)
          this.tourExecutionService.startTour(tourId, this.location.latitude, this.location.longitude, this.user?.id as number).subscribe({
            next: (result) => {
              if (result) {
                this.tourStarted = true;
                console.log('Tura je uspešno započeta!');
                this.notificationService.notify({ message: 'Tour started successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
                this.router.navigate(['/tourSession', tourId]);
              } else {
                // alert('Tura nije mogla biti započeta.');
                this.notificationService.notify({ message: 'Tour could not be started!', duration: 3000, notificationType: NotificationType.WARNING });
              }
            },
            error: () => {
              // alert('The selected tour can not be started!');
              this.notificationService.notify({ message: 'The selected tour can not be started!', duration: 3000, notificationType: NotificationType.WARNING });
            }
          });
        },
        error: () => {
          // alert('Došlo je do greške prilikom ucitavanja lokacije.');
          this.notificationService.notify({ message: 'Error loading location!', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });

    } else {
      // console.warn('Lokacija ili tourId nisu dostupni za startovanje ture.');
      this.notificationService.notify({ message: 'Location or tourId not available for starting the tour!', duration: 3000, notificationType: NotificationType.WARNING });
    }
  }

  confirmAction(tourId: number): void {

    const message = 'Are you sure you want to refund this tour?';

    if (window.confirm(message)) {
      this.onRefundTour(tourId);
    }
  }


  onRefundTour(tourId: number) {
    this.service.refundTour(tourId).subscribe({
      next: (tour) => {
        console.log('Tour refunded successfully:', tour);
        this.notificationService.notify({ message: 'Tour refunded successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Error refunding tour:', err);
        this.notificationService.notify({ message: 'Error refunding tour!', duration: 3000, notificationType: NotificationType.WARNING });
      },
    });
  }



}
