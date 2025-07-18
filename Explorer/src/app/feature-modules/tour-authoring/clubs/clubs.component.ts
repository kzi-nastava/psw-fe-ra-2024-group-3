import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Clubs } from '../model/clubs.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ImageService } from 'src/app/shared/image.service';
import { Tourist } from '../model/tourist.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';

@Component({
  selector: 'xp-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  clubs: Clubs[] = [];
  selectedClub: any;
  shouldRenderClubForm: boolean = false;
  shouldEdit: boolean = false;
  image: File;
  tourists : Tourist[] = [] ; // List of all tourists
  touristsInv : Tourist[] = [] ; // List of tourists to display in modal
  isModalOpen = false;
  isLoading = false;
  members: Tourist[] = [];
  activeTab: string = 'invites';
  reqMembers: Tourist[] = [];

  invitedClubs: Clubs[] = []; // Clubs that invited the logged-in tourist
  isInvitationModalOpen = false;
  isClubFormModalOpen = false;
  searchQuery: string = '';
  filteredTourists = this.touristsInv;
  filteredMembers = this.members;
  filteredRequests = this.reqMembers;

  

  user : User

  constructor(private service: TourAuthoringService, private imageService: ImageService, 
    private cd: ChangeDetectorRef, private authService: AuthService,
               private notificationService: NotificationService
              ) {
    this.isLoading = false;
    imageService.setControllerPath("tourist/image");
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      console.log("ulogovao se korisnik")
      console.log(user.id)
    });
      this.getClubs();

  }
  getClubs(): void {
    this.isLoading = true;
    this.service.getClubs().subscribe({
      next: (result: PagedResults<Clubs>) => {
        console.log(result)
        this.clubs = result.results
        // kod za ucitavanje slike po id
        this.isLoading = false;
        this.clubs.forEach(element => {
          this.imageService.getImage(element.imageId.valueOf()).subscribe((blob: Blob) => {
            console.log(blob);  // Proveri sadržaj Blob-a
            if (blob.type.startsWith('image')) {
              element.image = URL.createObjectURL(blob);
              this.cd.detectChanges();
            } else {
              console.error("Blob nije slika:", blob);
            }
          });

        });
        //kraj
      },
      error: (err: any) => {
        console.log(err)
        this.isLoading = false;
        this.notificationService.notify({ message:'Failed to load clubs. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    })
  }

  deleteClub(id: number): void {
    this.service.deleteClub(id).subscribe({
      next: () => {
        this.getClubs();
        this.notificationService.notify({ message:'Club deleted successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
      },
      error: (err: any) => {
        console.log(err);
        this.notificationService.notify({ message:'Failed to delete club. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    })
  }

  onEditClicked(club: Clubs): void {
    this.selectedClub = club;
    this.shouldRenderClubForm = true;
    this.shouldEdit = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderClubForm = true;
  }
  //clubs: Clubs[] = [{id:0, name: "prvi", description: "najbolji"}, {id:1, name: "prvi nismo", description: "ne i najbolji"} ]

  openModal(club: any): void {
    this.selectedClub = club;
    this.isModalOpen = true;

    // Load the tourists list (replace with your actual method)
    this.loadTourists();
    this.loadMembers();
    this.loadReqMembers();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedClub = undefined;
  }

  loadTourists(): void {
    // Replace this with the actual service call to fetch tourists
    this.service.getTourists().subscribe({
      next: (response) => {
        // Assuming PagedResults has a `results` array with the tourists
        this.tourists = response;
        console.log(this.tourists)
        this.touristsInv = this.tourists.filter((t) => t.id !== this.user.id)
        this.filteredTourists = this.touristsInv
      },
      error: (err) => {
        console.error('Failed to load tourists:', err);
        // alert('There was an error loading the tourists list. Please try again later.');
        this.notificationService.notify({ message:'Failed to load tourists. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  inviteTourist(tourist: any): void {
    // Replace with your logic for sending an invite
    this.service.inviteUser(this.selectedClub?.id, tourist.id).subscribe(
      {
        
      });
    console.log(`Invited ${tourist.username} to club ${this.selectedClub?.name}`);
    alert(`Invited ${tourist.username} to club ${this.selectedClub?.name}`);
  }

  loadMembers(): void {
    this.members = this.tourists.filter(tourist => this.selectedClub.memberIds.includes(tourist.id));
    this.filteredMembers = [...this.members]
    //
    //return this.members
  }

  loadReqMembers(): void {
    this.reqMembers = this.tourists.filter(tourist => this.selectedClub.requestIds.includes(tourist.id));
    this.filteredRequests = [...this.reqMembers]
    //return this.reqMembers
  }

setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'members' || this.members.length === 0) {
        this.loadMembers();
    }
    if (tab === 'requests' || this.members.length === 0) {
      this.loadReqMembers();
  }
}

removeMember(member: Tourist) {
  if(member.id)
    this.service.removeMember(this.selectedClub.id, member.id).subscribe(() => {
        this.members = this.members.filter(m => m.id !== member.id);
        this.selectedClub.memberIds = this.selectedClub.memberIds.filter((id:number) => id !== member.id);
        this.loadMembers()
    });
}

 // Fetch invitations for the logged-in tourist
 viewInvitations() {
  this.service.getInvitations().subscribe((data) => {
    this.invitedClubs = data.results;
    console.log(this.invitedClubs)
    console.log(this.invitedClubs.length)
    this.isInvitationModalOpen = true;
  });
}

closeInvitationModal() {
  this.isInvitationModalOpen = false;
}

openInvitationModal() {
  this.viewInvitations()
  //this.isInvitationModalOpen = true;
}

acceptInvitation(clubId: number) {
  this.service.acceptInvitation(clubId).subscribe(() => {
    this.invitedClubs = this.invitedClubs.filter((club) => club.id !== clubId);
    // Find and update the selected club
    this.selectedClub = this.clubs.find((club) => club.id === clubId);
    console.log("trenutni klub")
    console.log(this.selectedClub)
    if (!this.selectedClub.memberIds) {
      this.selectedClub.memberIds = [];
  }
    this.selectedClub.memberIds.push(this.user.id); // Use `push` instead of `add`
    console.log(this.selectedClub)
    this.loadMembers()
  });
}

rejectInvitation(clubId: number) {
  this.service.rejectInvitation(clubId).subscribe(() => {
    this.invitedClubs = this.invitedClubs.filter((club) => club.id !== clubId);
  });
}

joinClub(clubId: number): void {
  this.service.joinClub(clubId).subscribe({
    next: () => {
      this.getClubs();
      //this.notificationService.notify({ message:'Club deleted successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
    },
    error: (err: any) => {
      console.log(err);
      this.notificationService.notify({ message:'Failed to request to join club. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
    }
  })
}

acceptRequest(clubId: number, reqMemberId: number) {
  this.service.acceptRequest(clubId, reqMemberId).subscribe(() => {
    // Find and update the selected club
    this.selectedClub = this.clubs.find((club) => club.id === clubId);
    console.log("trenutni klub")
    console.log(this.selectedClub)
    if (!this.selectedClub.memberIds) {
      this.selectedClub.memberIds = [];
  }
    this.selectedClub.memberIds.push(reqMemberId); // Use `push` instead of `add`
    this.selectedClub.requestIds.pop(reqMemberId); // 
    this.reqMembers = this.reqMembers.filter((reqMember) => reqMember.id === reqMemberId) // 
    //this.selectedClub.requestIds = this.selectedClub.requestIds.filter((id:number) => id === reqMemberId)
    console.log(this.selectedClub)
    this.loadMembers()
    this.loadReqMembers()
  });
}

denyRequest(clubId: number, reqMemberId: number) {
  this.service.denyRequest(clubId, reqMemberId).subscribe(() => {
    this.selectedClub.requestIds.pop(reqMemberId); // 
    this.reqMembers = this.reqMembers.filter((reqMember) => reqMember.id === reqMemberId) //
    this.loadReqMembers() 
  });
}

openClubFormModal(club?: any) {
  this.selectedClub = club || null;
  this.shouldEdit = !!club;
  this.isClubFormModalOpen = true;
}

closeClubFormModal() {
  this.isClubFormModalOpen = false;
}

filterList(tab: string): void {
  const query = this.searchQuery.toLowerCase();
  if (tab === 'invites') {
    this.filteredTourists = this.touristsInv.filter(tourist =>
      tourist.username!.toLowerCase().includes(query)
    );
  } else if (tab === 'members') {
    this.filteredMembers = this.members.filter(member =>
      member.username!.toLowerCase().includes(query)
    );
  } else if (tab === 'requests') {
    this.filteredRequests = this.reqMembers.filter(reqMember =>
      reqMember.username!.toLowerCase().includes(query)
    );
  }
}

}
