import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { Equipment } from '../model/equipment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';

@Component({
  selector: 'xp-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.css']
})
export class EquipmentComponent implements OnInit {

  equipment: Equipment[] = [];
  selectedEquipment: Equipment;
  shouldRenderEquipmentForm: boolean = false;
  shouldEdit: boolean = false;
  isLoading = false;
  
  constructor(private service: AdministrationService,private notificationService:NotificationService) { }

  ngOnInit(): void {
    this.getEquipment();
  }
  
  deleteEquipment(id: number): void {
    this.service.deleteEquipment(id).subscribe({
      next: () => {
        this.getEquipment();
        this.notificationService.notify({ message:'Equipment deleted successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.notify({ message:'Failed to delete equipment. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    })
  }

  getEquipment(): void {
    this.isLoading = true;
    this.shouldRenderEquipmentForm = false;
    this.service.getEquipment().subscribe({
      next: (result: PagedResults<Equipment>) => {
        this.isLoading = false;
        this.equipment = result.results;
        // this.notificationService.notify({ message:'Data loaded successfully!', 'Close', {
        //   duration: 3000,
        //   panelClass:"succesful"
        // });
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.notify({ message:'Failed to load data. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    })
  }

  onEditClicked(equipment: Equipment): void {
    this.selectedEquipment = equipment;
    this.shouldRenderEquipmentForm = true;
    this.shouldEdit = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderEquipmentForm = true;
  }
}
