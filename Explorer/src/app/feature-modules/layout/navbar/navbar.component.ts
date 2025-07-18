import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Notification, NotificationType } from 'src/app/feature-modules/layout/model/notification.model';
import { LayoutService } from '../layout.service';
import { Router } from '@angular/router';
import { UserProfile } from '../model/user-profile.model';
import { ImageService } from 'src/app/shared/image.service';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EncounterService } from '../../encounters/encounter.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Encounter } from '../../encounters/model/encounter.model';
import { AdministrationService } from '../../administration/administration.service';
import { Achievement } from '../../administration/model/achievement.model';

@Component({
  selector: 'xp-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css', '../../../../styles.css']
})
export class NavbarComponent implements OnInit {
  @Output() previewAchiNotification = new EventEmitter<string>();
  
  selectedTab: string = 'explore-tours';
  user: User | undefined;
  notifications: Notification[] = [];
  showNotifications: boolean = false;
  userProfile: UserProfile;
  showProfileMenu: boolean = false;
  showLocationButton: boolean = true;
  NotificationType = NotificationType;
  badge: string = '';
  unreadNotifications: number = 0;

  constructor(private authService: AuthService, private administrationService: AdministrationService, private layoutService: LayoutService, private router: Router, private imageService: ImageService, private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.selectedTab = this.router.url.split('/').pop()||'';
        this.showLocationButton = !this.router.url.startsWith('/tourSession');
        console.log('Current URL:', this.router.url);
        console.log('Hide Location Button:', this.showLocationButton);
      });

    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user.role === 'tourist') {
        this.administrationService.getAchievements().subscribe({
          next: (result: Achievement[]) => {
            var achievements = result.filter(a => a.type === 7 && a.imagePath != 'assets/badge.png').sort((a, b) => b.criteria - a.criteria);
            this.badge = achievements[0].imagePath || '';
          },

        });
      }

      if (user.role === 'author') {
        this.layoutService.getAuthorNotifications(user.id).subscribe(notificationsData => {
          console.log('notificationsData:', notificationsData);
          this.notifications = notificationsData;
          this.sortNotifications();
          console.log('notifications:', this.notifications);
        });
      }
      else if (user.role === 'tourist') {
        this.layoutService.getTouristNotifications(user.id).subscribe(notificationsData => {
          this.notifications = notificationsData;
          this.sortNotifications();
          console.log("NOTIFICATIONS : ", this.notifications)
        });
      }
      if (this.user.username !== '') {
        this.layoutService.getProfile(user.role).subscribe({
          next: (result: UserProfile) => {
            this.userProfile = result;
            console.log(result)
            this.imageService.setControllerPath(user.role + "/image");
            this.imageService.getImage(Number(this.userProfile.imageURL)).subscribe({
              next: (blob: Blob) => {
                console.log(blob);
                if (blob.type.startsWith('image')) {
                  this.userProfile.imageURL = URL.createObjectURL(blob);
                  this.cd.detectChanges();
                } else {
                  console.error("Blob nije slika:", blob);
                }
              },
              error: () => {
                this.userProfile.imageURL = 'assets/user.png';
              }
            });
          },
          error: (err: any) => {
            console.log(err)
          }
        })
      }
    });


  }

  sortNotifications(): Notification[] {
    this.unreadNotifications = this.notifications.filter(n => !n.isRead).length;
    return this.notifications.sort((a, b) => {
      if (a.isRead && !b.isRead) {
        return 1;
      }
      if (!a.isRead && b.isRead) {
        return -1;
      }
      return 0;
    });
  }

  goToHome(): void {
    console.log("Metoda goToHome pozvana!");
    console.log("Navigacija ka: ", this.user?.role);
    if (this.user?.role === 'administrator') {
      this.router.navigate(['/account']);
    } else if (this.user?.role === 'author') {
      this.router.navigate(['/tours']);
    } else if (this.user?.role === 'tourist') {
      this.router.navigate(['/explore-tours']);
    }
  }
  myLibrary() {
    this.showProfileMenu = !this.showProfileMenu;
    this.router.navigate(['/library']);
  }

  myProfile() {
    this.showProfileMenu = !this.showProfileMenu;
    this.router.navigate(['/profile']);
  }
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.cd.detectChanges();
  }
  goToProblem(notification: Notification, problemId: number): void {
    if (this.user?.role === 'tourist') {
      this.layoutService.markAsReadTourist(notification).subscribe(result => {
        //this.notifications = this.notifications.filter(n => n !== notification);
        notification.isRead = true;
        this.sortNotifications();
        if (notification.type === NotificationType.GroupCancelation) {
          this.router.navigate(['explore-tours']);
        }
        else if (notification.type === NotificationType.TourRefund) {
          this.router.navigate(['explore-tours'], { queryParams: { refundId: notification.referenceId } });
        } else if (notification.type === NotificationType.Achievement) {
          this.previewAchiNotification.emit(notification.content + ",," + notification.imagePath);
        } else {
          this.router.navigate(['/problem'], { queryParams: { id: problemId } });
        }
      });
    }
    else if (this.user?.role === 'author') {
      this.layoutService.markAsReadAuthor(notification).subscribe(result => {
        //this.notifications = this.notifications.filter(n => n !== notification);
        notification.isRead = true;
        this.sortNotifications();
        if (notification.type == NotificationType.TourProblem) this.router.navigate(['/problem'], { queryParams: { id: problemId } });
      });
    }
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: Notification): void {
    if (this.user?.role === 'tourist') {
      this.layoutService.markAsReadTourist(notification).subscribe({
        next: (result: any) => {
          console.log("Marked as read: ", result);
          notification.isRead = true;
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    }
    else if (this.user?.role === 'author') {
      this.layoutService.markAsReadAuthor(notification).subscribe({
        next: (result: any) => {
          console.log("Marked as read: ", result);
          notification.isRead = true;
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    }
  }

  delete(notification: Notification): void {
    if (this.user?.role === 'tourist') {
      this.layoutService.deleteNotificationTourist(notification).subscribe({
        next: (result: any) => {
          console.log("Notification deleted: ", result);
          this.notifications = this.notifications.filter(n => n !== notification);
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    }
    else if (this.user?.role === 'author') {
      this.layoutService.deleteNotificationAuthor(notification).subscribe({
        next: (result: any) => {
          console.log("Notification deleted: ", result);
          this.notifications = this.notifications.filter(n => n !== notification);
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  onLogout(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.authService.logout();
    this.notifications = [];
  }
}
