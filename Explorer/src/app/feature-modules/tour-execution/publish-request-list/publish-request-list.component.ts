import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { TourExecutionService } from '../tour-execution.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { PublishRequest } from '../model/publish-request.model';
import { TourAuthoringService } from 'src/app/feature-modules/tour-authoring/tour-authoring.service';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Comment} from '../model/problem.model';
import { DatePipe, CommonModule } from '@angular/common';
import { KeyPoint } from '../../tour-authoring/model/key-point.model';
import { Object } from '../../tour-authoring/model/object.model';
import { ImageService } from 'src/app/shared/image.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';


@Component({
    selector: 'xp-request-list',
    templateUrl: './publish-request-list.component.html',
    styleUrls: ['./publish-request-list.component.css']

})export class PublishRequestComponent {
    entities: PublishRequest[] = [];   
    displayedEntities: PublishRequest[] = [];
  
    currentPage = 0;
    totalPages = 0;
    pageSize = 9;
  
    user: User | undefined;

    usernamesMap: Map<number, string> = new Map();

    constructor(private service: TourExecutionService, private tourService:TourAuthoringService, private router: Router, private authService: AuthService, private imageService: ImageService,private notificationService: NotificationService) { imageService.setControllerPath("administrator/image");} 
    ngOnInit(): void {

        this.authService.user$.subscribe((user: User | undefined) => {
          this.user = user;
          console.log("User role:", this.user?.role);
          this.loadAllRequests();

      });
      }
      loadAllRequests(): void {
        if(this.user?.role=='administrator'){
          this.service.getPublishRequests().subscribe({
            next: (result: PagedResults<PublishRequest>) => {
              const filteredResults = result.results.filter(e => e.status === 0);
              this.entities = filteredResults;
              this.displayedEntities = filteredResults;
              this.populateUsernamesAd(this.entities.map(e => e.authorId));
              this.fetchKeyPointDetails();
              this.fetchObjectDetails();
              console.log("posle funkcije");
            },
            error: (err: any) => {
              console.log(err);
              this.notificationService.notify({message: 'Error loading requests.', duration: 3000,notificationType:NotificationType.WARNING});
            }
          });
        }
    }

    getEnumForStatus(id: number): string {
    
        let ret: string;
    
        switch (id) {
        case 0:
          return 'Pending';
        case 1:
          return 'Accepted';
        case 2:
            return 'Reject';
        default:
          return 'Unknown'; 
        }
    }
    fetchKeyPointDetails(): void {
     
      this.displayedEntities.forEach(request => {
      
        if (request.entityId && request.type==1) {
        
          this.tourService.getKeyPointById(request.entityId).subscribe({
            next: (keyPoint: KeyPoint) => {
              
              request.name = keyPoint.name; 
              request.latitude = keyPoint.latitude; 
              request.longitude = keyPoint.longitude; 
              request.description = keyPoint.description;
              request.imagePath = keyPoint.imagePath; 
            },
            error: err => {
              console.error(`Error loading KeyPoint with ID ${request.entityId}:`, err);
              this.notificationService.notify({message: 'Error loading KeyPoint.', duration: 3000,notificationType:NotificationType.WARNING});
            },
          });
        }
      });
    }

    fetchObjectDetails(): void {
      this.displayedEntities.forEach(request => {
        if (request.entityId && request.type==0) {
          this.tourService.getObjectById(request.entityId).subscribe({
            next: (object: Object) => {
              request.name = object.name; 
              request.latitude = object.latitude as number; 
              request.longitude = object.longitude as number; 
              request.description = object.description;
              this.imageService.setControllerPath("administrator/image");
              this.imageService.getImage(object.imageId.valueOf()).subscribe((blob: Blob) => {
                  console.log(blob);  
                  if (blob.type.startsWith('image')) {
                    object.image = URL.createObjectURL(blob);
                    request.imagePath = object.image; 
                    //this.cd.detectChanges();
                  } else {
                    console.error("Blob nije slika:", blob);
                  }
                });
              
                this.authService.getUsernameAd(request.authorId).subscribe(username => {
                  request.authName = username;
              });
            },
            error: err => {
              console.error(`Error loading Object with ID ${request.entityId}:`, err);
              this.notificationService.notify({message: 'Error loading Object.', duration: 3000,notificationType:NotificationType.WARNING});
            },
          });
        }
      });
    }
  
  
    
    getEnumForType(id: number): string {
    
        let ret: string;
    
        switch (id) {
        case 0:
          return 'Object';
        case 1:
          return 'KeyPoint';
        default:
          return 'Unknown'; 
        }
    }

    populateUsernamesAd(ids: number[]): void {
        ids.forEach(id => {
            this.authService.getUsernameAd(id).subscribe(username => {
                this.usernamesMap.set(id, username);
            });
        });
    }
    acceptRequest(request: PublishRequest | undefined): void {
      if (!request) {
        console.error('Request is undefined.');
        this.notificationService.notify({message: 'Request is undefined.', duration: 3000,notificationType:NotificationType.INFO});
        return;
      }
    
      if (!this.user || !this.user.id) {
        console.error('User is undefined or does not have an ID.');
        this.notificationService.notify({message: 'User is undefined or does not have an ID.', duration: 3000,notificationType:NotificationType.INFO});
        return;
      }
    
      request.status = 1;
      request.adminId = this.user.id;
    
      if(request.type==1){
      this.service.updateRequestStatus(request).subscribe({
        next: (updatedRequest: PublishRequest) => {
          console.log('Request successfully updated:', updatedRequest);
    
          this.entities = this.entities.filter((e) => e.id !== request.id);
    
          
          this.displayedEntities = [...this.entities];
          this.notificationService.notify({message: 'Request accepted.', duration: 3000,notificationType:NotificationType.SUCCESS});
        },
        error: (err) => {
          console.error('Error updating request:', err);
          this.notificationService.notify({message: 'Error accepting request.', duration: 3000,notificationType:NotificationType.WARNING});
        },
      });
    }else{
      this.service.updateRequestStatusObject(request).subscribe({
        next: (updatedRequest: PublishRequest) => {
          console.log('Object successfully updated:', updatedRequest);
    
          this.entities = this.entities.filter((e) => e.id !== request.id);
    
          
          this.displayedEntities = [...this.entities];
          this.notificationService.notify({message: 'Object accepted.', duration: 3000,notificationType:NotificationType.SUCCESS});
        },
        error: (err) => {
          console.error('Error updating request:', err);
          this.notificationService.notify({message: 'Error accepting object.', duration: 3000,notificationType:NotificationType.WARNING});
        },
      });
    }
    }
    rejectRequest(request: PublishRequest | undefined): void {
      if (!request) {
        console.error('Request is undefined.');
        this.notificationService.notify({message: 'Request is undefined.', duration: 3000,notificationType:NotificationType.INFO});
        return;
      }
    
      if (!this.user || !this.user.id) {
        console.error('User is undefined or does not have an ID.');
        this.notificationService.notify({message: 'User is undefined or does not have an ID.', duration: 3000,notificationType:NotificationType.INFO});
        return;
      }
    
      request.status = 2;
      request.adminId = this.user.id;
    
      if(request.type==1){
      this.service.updateRequestStatus(request).subscribe({
        next: (updatedRequest: PublishRequest) => {
          console.log('Request successfully rejected:', updatedRequest);
    
          this.entities = this.entities.filter((e) => e.id !== request.id);
    
          
          this.displayedEntities = [...this.entities];
          this.notificationService.notify({message: 'Request rejected.', duration: 3000,notificationType:NotificationType.SUCCESS});
        },
        error: (err) => {
          console.error('Error updating request:', err);
          this.notificationService.notify({message: 'Error rejecting request.', duration: 3000,notificationType:NotificationType.WARNING});
        },
      });
    }else{
      this.service.updateRequestStatusObject(request).subscribe({
        next: (updatedRequest: PublishRequest) => {
          console.log('Object successfully rejected:', updatedRequest);
    
          this.entities = this.entities.filter((e) => e.id !== request.id);
    
          
          this.displayedEntities = [...this.entities];
          this.notificationService.notify({message: 'Object rejected.', duration: 3000,notificationType:NotificationType.SUCCESS});
        },
        error: (err) => {
          console.error('Error updating request:', err);
          this.notificationService.notify({message: 'Error rejecting object.', duration: 3000,notificationType:NotificationType.WARNING});
        },
      });
    }
    }
}