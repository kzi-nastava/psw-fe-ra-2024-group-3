import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageService } from 'src/app/shared/image.service';
import { Story } from '../model/story.model';
import { StoryService } from '../story.service';

@Component({
  selector: 'xp-story-form',
  templateUrl: './story-form.component.html',
  styleUrls: ['./story-form.component.css']
})
export class StoryFormComponent {
  storyForm: FormGroup;
  keyPointId: number;
  tourId:number;
  story:Story;
  imageId:Number;
  selectedFile: File;
  previewImage: string | null = null
  constructor(private fb: FormBuilder, private router:Router, private route: ActivatedRoute, private snackBar: MatSnackBar, private service:StoryService, private imageService: ImageService) {
  
    imageService.setControllerPath("author/image");
    
    this.storyForm = this.fb.group({
      title: ['', Validators.required], 
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.keyPointId = +this.route.snapshot.paramMap.get('id')!;
    this.tourId = +this.route.snapshot.paramMap.get('tourId')!;
    this.story = {
      id: 0,
      authorId: 0,
      content: '',
      title:'',
      bookId: -500,
      status: 0,
      imageId:-10,
      image:''
    };
  }
  onFileSelected(fileOrEvent: File | Event): void {
    if (fileOrEvent instanceof File) {
      // If the input is already a File
      this.selectedFile = fileOrEvent;
    } else if (fileOrEvent instanceof Event) {
      // If the input is an Event, extract the File
      const input = fileOrEvent.target as HTMLInputElement;
      if (input && input.files && input.files[0]) {
        this.selectedFile = input.files[0];
      } else {
        console.error('No file selected');
        return;
      }
    }
    console.log('Selected file:', this.selectedFile);
  }
  
  onSubmit(): void {

    this.story.content = this.storyForm.get('content')?.value;
    this.story.title = this.storyForm.get('title')?.value;
    this.imageService.setControllerPath("author/image");
    
    if (this.storyForm.invalid) {
      this.storyForm.markAllAsTouched(); 
      this.snackBar.open('Please fill all fields.', 'Close', {
        duration: 3000,
        panelClass: "error"
      });
      return; 
    }
    this.imageService.uploadImage(this.selectedFile).subscribe((imageId: number) => {
      this.imageService.getImage(imageId);
      this.story.imageId=imageId;
      this.addStory(this.story);
      this.router.navigate(['/key-points',this.tourId]);
    })
}

addStory(story: Story): void {
  this.service.addStory(story, this.keyPointId).subscribe({
    next: (response) => {
      console.log('Added Story', response);
      this.snackBar.open('Story added successfully!', 'Close', {
        duration: 3000,
        panelClass: "succesful"
      });
    },
    error: () => {
      console.log('Došlo je do greške prilikom kreiranja price.');
      this.snackBar.open('Failed to add story. Please try again.', 'Close', {
        duration: 3000,
        panelClass: "succesful"
      });
    }
  });
}
}