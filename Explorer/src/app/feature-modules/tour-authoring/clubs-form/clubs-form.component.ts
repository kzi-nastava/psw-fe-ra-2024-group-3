import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TourAuthoringService } from '../tour-authoring.service';
import { Clubs } from '../model/clubs.model';
import { ImageService } from 'src/app/shared/image.service';

@Component({
  selector: 'xp-clubs-form',
  templateUrl: './clubs-form.component.html',
  styleUrls: ['./clubs-form.component.css']
})
export class ClubsFormComponent implements OnChanges {
  @Output() clubsUpdated = new EventEmitter<null>();
  @Input() club: Clubs;
  @Input() shouldEdit: boolean = false;
  selectedFile: File;
  previewImage: string | null = null
  imageId: number;

  constructor(private service: TourAuthoringService, private imageService: ImageService) {
    imageService.setControllerPath("tourist/image");
  }

  clubForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required])
  });

  ngOnChanges(): void {
    if (this.shouldEdit) {
      this.clubForm.patchValue(this.club);
    } else {
      this.clubForm.reset();
    }
  }

  /* Handle image selection */
  onFileSelected(file: File): void {
    this.selectedFile = file;
    console.log('Selected file:', this.selectedFile);
  }

  /* Submit the form */
  onSubmit(): void {
    if (this.clubForm.valid) {
      if (this.shouldEdit) {
        this.updateClub();
      } else {
        this.addClub();
      }
    }
  }

  /* Add a new club */
  addClub(): void {
    const club: Clubs = {
      name: this.clubForm.value.name || "",
      description: this.clubForm.value.description || "",
      imageId: -1,
      image: "",
      memberIds: [],
      invitationIds: []
    };

    this.imageService.uploadImage(this.selectedFile).subscribe((imageId: number) => {
      this.imageService.getImage(imageId);
      club.imageId = imageId;
      this.service.addClub(club).subscribe({
        next: (_) => {
          console.log("Club added successfully");
          this.clubForm.reset();
          this.previewImage = null;
          this.clubsUpdated.emit();
        },
        error: (err) => {
          console.error("Error adding club", err);
        }
      });
    });
  }

  /* Update an existing club */
  updateClub(): void {
    const club: Clubs = {
      name: this.clubForm.value.name || "",
      description: this.clubForm.value.description || "",
      imageId: this.club.imageId, // Default to existing imageId
      image: this.club.image,
      memberIds: this.club.memberIds,
      invitationIds: this.club.invitationIds
    };

    club.id = this.club.id;

    if (this.selectedFile) {
      this.imageService.uploadImage(this.selectedFile).subscribe((newImageId: number) => {
        club.imageId = newImageId;
        this.executeClubUpdate(club); // Proceed with update if new image is uploaded
      });
    } else {
      this.executeClubUpdate(club); // Proceed with update if no new image
    }
  }

  /* Execute the club update */
  private executeClubUpdate(club: Clubs): void {
    this.service.updateClub(club).subscribe({
      next: () => {
        console.log("Club updated successfully");
        this.clubForm.reset();
        //this.selectedFile = null;
        this.clubsUpdated.emit();
      },
      error: (err) => {
        console.error("Error updating club", err);
      }
    });
  }
}
