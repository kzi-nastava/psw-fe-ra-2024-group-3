import { Component, OnInit } from '@angular/core';
import { TourAuthoringService } from '../tour-authoring.service';
import { Tour } from '../model/tour.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';
import { BlogService } from '../../blog/blog.service';
import { Blog } from '../../blog/model/blog.model';

@Component({
    selector: 'xp-tour',
    templateUrl: './explore-tours.html',
    styleUrls: ['./explore-tours.css']
})
export class ExploreToursComponent implements OnInit {

    tours: Tour[] = [];
    topBlogs: Blog[] = [];
    isLoading = false;
    selectedTourId: number | null = null;

    constructor(private service: TourAuthoringService,
        private blogService: BlogService, private router: Router, private notificationService: NotificationService) { }

    ngOnInit(): void {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaa');
        this.getTours();
        this.getTopBlogs();

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
                this.notificationService.notify({ message: 'Failed to load tours. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
            }
        });
    }

    getTopBlogs(): void {
        this.isLoading = true;
        this.blogService.getTopBlogs().subscribe({
            next: (result: Blog[]) => {
                this.topBlogs = result;
                console.log("blogoviiiiiiiiiii" + this.topBlogs);
                this.isLoading = false;
            },
            error: () => {
                this.notificationService.notify({ message: 'Failed to load top blogs. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
            }
        });
    }

    viewBlog(blogId: any) {
        // Navigate to the blog's detail page or open the blog
        this.router.navigate(['/comments/', blogId]); // Assuming you have routing set up
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
