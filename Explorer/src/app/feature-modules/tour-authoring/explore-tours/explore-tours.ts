import { Component, OnInit } from '@angular/core';
import { TourAuthoringService } from '../tour-authoring.service';
import { Tour } from '../model/tour.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'xp-tour',
    templateUrl: './explore-tours.html',
    styleUrls: ['./explore-tours.css']
})
export class ExploreToursComponent implements OnInit {

    tours: Tour[] = [];
    isLoading = false;
    selectedTourId: number | null = null;

    constructor(private service: TourAuthoringService, private router: Router, private snackBar: MatSnackBar) { }

    ngOnInit(): void { 
        this.getTours();

        this.router.routerState.root.queryParams.subscribe(params => {
            this.selectedTourId = params['selectedTourId'] ? +params['selectedTourId'] : null;
          });
    }

    getTours(): void {
        this.isLoading = true;
        this.service.getTours().subscribe({
            next: (result: PagedResults<Tour>) => {  // Assuming PagedResults<Tour> is used
                this.tours = result.results;
                console.log(this.tours);
                this.isLoading = false;
            },
            error: () => { /* Handle error */
                this.snackBar.open('Failed to load tours. Please try again.', 'Close', {
                    duration: 3000,
                    panelClass: "succesful"
                });
            }
        });
    }

    getDifficultyLabel(difficulty: number): string {
        switch (difficulty) {
            case 0:
                return 'Easy';
            case 1:
                return 'Medium';
            case 2:
                return 'Hard';
            default:
                return 'Unknown';
        }
    }

    getStatusLabel(status: number): string {
        switch (status) {
            case 0:
                return 'Draft';
            case 1:
                return 'Published';
            default:
                return 'Unknown';
        }
    }

    isSelectedTour(tourId: number | undefined): boolean {
        return tourId !== undefined && this.selectedTourId === tourId;
      }
}
