import { Component, OnInit } from "@angular/core";
import { Bundle } from "../model/bundle.model";
import { User } from "src/app/infrastructure/auth/model/user.model";
import { BundleService } from "../bundle.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/infrastructure/auth/auth.service";
import { Router } from "@angular/router";
import { Tour } from "../../tour-authoring/model/tour.model";
import { NotificationService } from "src/app/shared/notification.service";
import { NotificationType } from "src/app/shared/model/notificationType.enum";

@Component({
    selector: 'xp-bundles',
    templateUrl: './bundle.component.html',
    styleUrls: ['./bundle.component.css']
})
export class BundleComponent implements OnInit {

    bundles: Bundle[] = [];
    isLoading = false;
    user: User;

    constructor(
        private service: BundleService,  // Assuming you have a service for bundles
        private notificationService: NotificationService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.user$.subscribe(user => {
            this.user = user;
            this.getBundles();
        });
    }

    // Fetch bundles for the author
    getBundles(): void {
        this.isLoading = true;
        this.service.getAuthorBundles(this.user.id).subscribe({
            next: (result: Bundle[]) => {
                this.bundles = result;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.log(err);
                this.isLoading = false;
                this.notificationService.notify({ message:'Failed to load bundles. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
            }
        });
    }

    // Route to the create new bundle page
    createNewBundle(): void {
        this.router.navigate(['/bundle-create']);
    }

    async updateBundleStatus(bundle: Bundle) {
        let newStatus: number;

        if (bundle.status === 0) {
            const canResolve = await this.checkTourStatus(bundle);
            if (!canResolve) {
                return;
            }
            newStatus = 1;
        } else if (bundle.status === 1) {
            newStatus = 2;
        } else {
            return;
        }

        const updatedBundle = { ...bundle, status: newStatus };

        // Send the updated bundle to the backend
        this.service.updateBundleStatus(updatedBundle).subscribe({
            next: () => {
                this.notificationService.notify({ message:'Bundle status updated successfully', duration: 3000, notificationType: NotificationType.SUCCESS });
                bundle.status = newStatus; // Update the status locally
            },
            error: (err) => {
                console.error(err);
                this.notificationService.notify({ message:'Failed to update bundle status', duration: 3000, notificationType: NotificationType.WARNING });
            }
        });
    }

    checkTourStatus(bundle: Bundle): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.service.getBundleTours(bundle.authorId, bundle.id!).subscribe({
                next: (tours: Tour[]) => {
                    console.log(tours); // Will now be logged properly
                    const publishedTours = tours.filter(tour => tour.status === 1);
                    if (publishedTours.length >= 2) {
                        resolve(true); // Resolve the promise with true
                    } else {
                        this.notificationService.notify({ message:'You need at least 2 published tours to publish the bundle', duration: 3000, notificationType: NotificationType.WARNING });
                        resolve(false); // Resolve the promise with false
                    }
                },
                error: (err) => {
                    console.error(err); // Will now log errors properly
                    this.notificationService.notify({ message:'Failed to load tours', duration: 3000, notificationType: NotificationType.WARNING });
                    resolve(false); // Handle error case
                }
            });
        });
    }

    getButtonLabel(status: number): string {
        if (status === 0) {
            return 'Publish';
        } else if (status === 1) {
            return 'Archive';
        } else {
            return 'Archived'; // No action when the status is 2
        }
    }

    // Method to get status text
    getStatusText(status: number): string {
        switch (status) {
            case 0: return 'Draft';
            case 1: return 'Published';
            default: return 'Archived';
        }
    }

    viewTours(bundle: Bundle): void {

        this.router.navigate(['/bundle/' + bundle.id + '/author/' + bundle.authorId]);
    }
}
