import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserProfile } from '../model/user-profile.model';
import { LayoutService } from '../layout.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ImageService } from 'src/app/shared/image.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EncounterService } from '../../encounters/encounter.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Encounter } from '../../encounters/model/encounter.model';
import { AdministrationService } from '../../administration/administration.service';
import { Achievement } from '../../administration/model/achievement.model';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';
import { TourShoppingService } from '../../tour-shopping/tour-shopping.service';
import { Wallet } from '../../tour-shopping/model/wallet.model';

@Component({
  selector: 'xp-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  user: User
  userProfile: UserProfile;
  isEditing = false;
  role: String = '';
  isLoading = false;
  isAdmin: boolean = false;
  showEncountersModal: boolean = false;
  selectedStatus: string = 'all';
  encounters: any[] = [];
  filteredEncounters: any[] = [];
  showAchievements: boolean = false;
  badge: string = '';
  wallet: Wallet | null = null;
  error: string | null = null;
  @ViewChild('achievementsSection') achievementsSection!: ElementRef;

  constructor(private layoutService: LayoutService,
    private router: Router,
    private authService: AuthService,
    private imageService: ImageService,
    private cd: ChangeDetectorRef,
    private encounterService: EncounterService,
    private administrationService: AdministrationService,
    private shoppingService: TourShoppingService,
    private notificationService:NotificationService) { }

  ngOnInit(): void {

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.role = user.role;
      if (this.role == 'administrator') {
        this.isAdmin = true;
      }
    });
    if (this.role === 'tourist') {
      this.loadWallet();
      this.administrationService.getAchievements().subscribe({
        next: (result: Achievement[]) => {
          var achievements = result.filter(a => a.type === 7 && a.imagePath != 'assets/badge.png').sort((a, b) => b.criteria - a.criteria);
          this.badge = achievements[0].imagePath || '';
        },
      });
    }
    this.getProfile()
    this.loadEncounters();
  }

  loadEncounters(): void {
    if (this.isAdmin) {
      this.encounterService.getAllEncountersForAdmin().subscribe((result: PagedResults<Encounter>) => {
        this.encounters = result.results;
        this.filterEncounters();
      });
    }
  }

  showEncounters(): void {
    this.showEncountersModal = true;
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.filterEncounters();
  }

  filterEncounters(): void {
    if (this.selectedStatus === 'draft') {
      this.filteredEncounters = this.encounters.filter(encounter => encounter.status == 0);
    } else {
      this.filteredEncounters = this.encounters;
    }
  }

  activateEncounter(encounter: any): void {
    // Logic to activate encounter
    if (encounter.status == 0) {
      this.encounterService.activateEncounter(encounter.id).subscribe({
        next: (result: Encounter) => {
          encounter.status = 1;
          this.filterEncounters();
          this.notificationService.notify({ message:'Encounter activated', duration: 3000, notificationType: NotificationType.SUCCESS });
        },
        error: () => {
          this.notificationService.notify({ message:'Unable to activate encounter', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });

    } else {
      this.notificationService.notify({ message:'Unable to activate becouse status is not draft', duration: 3000, notificationType: NotificationType.WARNING });
    }
  }

  getProfile() {
    this.isLoading = true;
    this.layoutService.getProfile(this.user.role).subscribe({
      next: (result: UserProfile) => {
        this.userProfile = result;
        console.log("User profile: ",result)
        // kod za ucitavanje slike po id
        this.isLoading = false;
        this.imageService.setControllerPath(this.role + "/image");
        this.imageService.getImage(Number(this.userProfile.imageURL)).subscribe({
          next: (blob: Blob) => {
            console.log(blob);  // Proveri sadržaj Blob-a
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

        //kraj
      },
      error: (err: any) => {
        console.log(err)
        this.isLoading = false;
        this.notificationService.notify({ message:'Failed to load profile. Please try again.', duration: 3000, notificationType: NotificationType.ERROR });
      }
    })
  }

  seeProblems(): void {
    this.router.navigate(['/problems']);
  }
  myReviews(): void {
    this.router.navigate(['/tourReviews']);
  }

  myBundles(): void {
    this.router.navigate(['/bundles']);
  }

  setPreferences(): void {
    this.router.navigate(['/tour-preferences']);
  }
  onProfileUpdated() {
    this.getProfile();
    this.isEditing = false;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  seeWallet(): void {
    this.router.navigate(['/wallet']);
  }

  ShowAchievements(): void {
    this.showAchievements = !this.showAchievements;
    if (this.showAchievements) {
      setTimeout(() => {
        this.achievementsSection.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start' // Poravnanje sa vrhom stranice
        });
      }, 100); // Dodaj delay da se element prikaže pre skrolovanja
    }
  }

  loadWallet(): void {
      this.shoppingService.getWallet().subscribe({
        next: (wallet: Wallet) => {
          this.wallet = wallet;
          this.error = null; // Clear any previous error
          this.isLoading = false; // Stop loading
        },
        error: (err) => {
          this.wallet = null;
          this.error = 'Failed to load wallet data. Please try again later.';
          this.isLoading = false; // Stop loading
          console.error('Error fetching wallet:', err); // Log for debugging
          this.notificationService.notify({message:'Error fetching wallet data', notificationType:NotificationType.WARNING,duration:3000}); // Notify user
        }
      });
    }
}

