import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  constructor(private layoutService: LayoutService,
    private router: Router,
    private authService: AuthService,
    private imageService: ImageService,
    private cd: ChangeDetectorRef,
    private encounterService: EncounterService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.role = user.role;
      if (this.role == 'administrator') {
        this.isAdmin = true;
      }
    });
    this.getProfile()
    this.loadEncounters();
  }

  loadEncounters(): void {
    this.encounterService.getAllEncountersForAdmin().subscribe((result: PagedResults<Encounter>) => {
      this.encounters = result.results;
      this.filterEncounters();
    });
  }

  showEncounters(): void {
    this.showEncountersModal = true;
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
          this.snackBar.open('Encounter activated', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Unable to activate encounter', 'Close', { duration: 3000 });
        }
      });

    } else {
      this.snackBar.open('Unable to activate becouse status is not draft', 'Close', { duration: 3000 });
    }
  }

  getProfile() {
    this.isLoading = true;
    this.layoutService.getProfile(this.user.role).subscribe({
      next: (result: UserProfile) => {
        this.userProfile = result;
        console.log(result)
        // kod za ucitavanje slike po id
        this.isLoading = false;
        this.imageService.setControllerPath(this.role + "/image");
        this.imageService.getImage(Number(this.userProfile.imageURL)).subscribe((blob: Blob) => {
          console.log(blob);  // Proveri sadržaj Blob-a
          if (blob.type.startsWith('image')) {
            this.userProfile.imageURL = URL.createObjectURL(blob);
            this.cd.detectChanges();
          } else {
            console.error("Blob nije slika:", blob);
          }
        });

        //kraj
      },
      error: (err: any) => {
        console.log(err)
        this.isLoading = false;
        this.snackBar.open('Failed to load profile. Please try again.', 'Close', {
          duration: 3000,
          panelClass: "succesful"
        });
      }
    })
  }

  seeProblems(): void {
    this.router.navigate(['/problems']);
  }
  myReviews(): void {
    this.router.navigate(['/tourReviews']);
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
}

