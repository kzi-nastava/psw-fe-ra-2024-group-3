import { Component } from '@angular/core';
import { Sale } from '../model/sale.model';
import { SaleService } from '../sales.service';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { Tour } from '../../tour-authoring/model/tour.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';

@Component({
  selector: 'xp-sales-creation',
  templateUrl: './sales-create.component.html',
  styleUrls: ['./sales-create.component.css']
})
export class SaleCreationComponent {
    constructor(
        private salesService: SaleService,
        private tourService: TourExecutionService,
        private notificationService: NotificationService
    ) {}

  // Sale data based on the Sale interface
  sale: Sale = {
    discount: 0,
    startTime: new Date(), 
    endTime: new Date(),
    tourIds: []
  };

  tours: Tour[] = [
  ];

  selectedTourIds = new Set<number>();

  // Validation messages
  errorMessage: string = '';

  ngOnInit(){
    this.getPublishedTours()
  }

  getPublishedTours(): void {
    this.tourService.getAllPublishedTours().subscribe({
      next: (result: Tour[]) => {
        this.tours = result;  
        console.log(this.tours);
      },
      error: () => {
        console.log("ERROR LOADING tours");
        this.notificationService.notify({message: 'Error loading tours', notificationType:NotificationType.WARNING,duration:3000});
      }
    });
  }

  // Submit sale data
  submitSale() {
    if (this.isValid()) {
      this.sale.tourIds = Array.from(this.selectedTourIds);
      this.sale.endTime = new Date(this.sale.endTime).toISOString()
      this.sale.startTime = new Date(this.sale.startTime).toISOString()
    //   console.log(this.sale)
      this.salesService.createSale(this.sale).subscribe({
        next: () => {
          console.log("Uspesno");
          this.notificationService.notify({message: 'Sale created successfully', notificationType:NotificationType.SUCCESS,duration:3000});
        },
        error: () => {
          console.log("ERROR LOADING tours");
          this.notificationService.notify({message: 'Error creating sale', notificationType:NotificationType.WARNING,duration:3000});
        }
      });
    } else {
      console.log('Invalid sale data.');
      this.notificationService.notify({message: 'Invalid sale data', notificationType:NotificationType.WARNING,duration:3000});
    }
  }

  toggleSelection(tourId: number | undefined): void {
    if (tourId) {  // Ensure tourId is not undefined or null
      if (this.selectedTourIds.has(tourId)) {
        this.selectedTourIds.delete(tourId);  // Deselect tour
      } else {
        this.selectedTourIds.add(tourId);  // Select tour
      }
    }
  }

  // Check validation for start and end times
  isValid(): boolean {
    const currentTime = new Date();
    
    if (new Date(this.sale.startTime) <= currentTime) {
      this.errorMessage = 'Start time must be greater than the current time.';
      return false;
    }

    const startTime = new Date(this.sale.startTime);
    const endTime = new Date(this.sale.endTime);
    const maxEndTime = new Date(startTime);
    maxEndTime.setDate(startTime.getDate() + 14);

    if (endTime <= startTime) {
      this.errorMessage = 'End time must be greater than the start time.';
      return false;
    } else if (endTime > maxEndTime) {
      this.errorMessage = 'End time must not be more than 2 weeks after the start time.';
      return false;
    }

    this.errorMessage = ''; 
    return true;
  }
}
