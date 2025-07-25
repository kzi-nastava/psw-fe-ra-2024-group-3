import { Component, OnInit } from '@angular/core';
import { Sale } from '../model/sale.model';
import { SaleService } from '../sales.service';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { Tour } from '../../tour-authoring/model/tour.model';

@Component({
  selector: 'xp-sales-creation',
  templateUrl: './sales-create.component.html',
  styleUrls: ['./sales-create.component.css'],
})
export class SaleCreationComponent implements OnInit {
  sale: Sale = {
    discount: 0,
    startTime: new Date(),
    endTime: new Date(),
    tourIds: [],
  };

  tours: Tour[] = [];
  selectedTourIds: Set<number> = new Set();
  errorMessage: string = '';
  currentDateTime: string = '';
  maxEndDateTime: string = '';

  constructor(
    private salesService: SaleService,
    private tourService: TourExecutionService
  ) {}

  ngOnInit(): void {
    this.setMinDateTime();
    this.getPublishedTours();
  }

  // Set the min date-time value to prevent past selection
  setMinDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toISOString().slice(0, 16); // For datetime-local input
  }

  // Load published tours
  getPublishedTours(): void {
    this.tourService.getAllPublishedTours().subscribe({
      next: (result: Tour[]) => {
        this.tours = result;
        console.log('Tours loaded:', this.tours);
      },
      error: () => {
        console.error('Error loading tours');
      },
    });
  }

  // Handle checkbox toggle
  toggleSelection(tourId: number | undefined): void {
    if (!tourId) return;
    this.selectedTourIds.has(tourId)
      ? this.selectedTourIds.delete(tourId)
      : this.selectedTourIds.add(tourId);
  }

  // Auto-correct endTime if it's earlier than startTime
  onStartTimeChange(): void {
  const start = new Date(this.sale.startTime);
  const end = new Date(this.sale.endTime);

  // Correct the end time if it's before start time
  if (end < start) {
    this.sale.endTime = new Date(start);
  }

  // Update max allowed endTime (2 weeks after start)
  const maxEnd = new Date(start);
  maxEnd.setDate(maxEnd.getDate() + 14);
  this.maxEndDateTime = maxEnd.toISOString().slice(0, 16);
}

  // Validate and submit sale
  submitSale(): void {
     if (this.sale.discount > 100) {
      alert('Discount cannot be greater than 100%.');
      return;
  }

    if (!this.isValid()) {
      console.warn('Invalid sale data:', this.errorMessage);
      return;
    }

    this.sale.tourIds = Array.from(this.selectedTourIds);
    this.sale.startTime = new Date(this.sale.startTime).toISOString();
    this.sale.endTime = new Date(this.sale.endTime).toISOString();

    this.salesService.createSale(this.sale).subscribe({
      next: () => {
        console.log('Sale created successfully');
        this.resetForm();
      },
      error: () => {
        console.error('Failed to create sale');
      },
    });
  }

  // Validations
  isValid(): boolean {
    const now = new Date();
    const start = new Date(this.sale.startTime);
    const end = new Date(this.sale.endTime);
    const maxEnd = new Date(start);
    maxEnd.setDate(start.getDate() + 14);

    if (start <= now) {
      this.errorMessage = 'Start time must be in the future.';
      return false;
    }

    if (end <= start) {
      this.errorMessage = 'End time must be after the start time.';
      return false;
    }

    if (end > maxEnd) {
      this.errorMessage =
        'End time must not be more than 2 weeks after the start time.';
      return false;
    }

    if (this.selectedTourIds.size === 0) {
      this.errorMessage = 'Please select at least one tour.';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  // Reset after success (optional)
  resetForm(): void {
    this.sale = {
      discount: 0,
      startTime: new Date(),
      endTime: new Date(),
      tourIds: [],
    };
    this.selectedTourIds.clear();
    this.setMinDateTime();
  }
}
