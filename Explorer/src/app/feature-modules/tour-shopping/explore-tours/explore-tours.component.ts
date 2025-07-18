import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Tour } from '../../tour-authoring/model/tour.model';
import { TourShoppingService } from '../tour-shopping.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { OrderItem } from '../model/order-item.model';
import { KeyPoint } from '../../tour-authoring/model/key-point.model';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TourReview } from '../../tour-authoring/model/tour-review.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageService } from 'src/app/shared/image.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaleService } from '../sales.service';
import { Sale } from '../model/sale.model';
import { GroupTourExecution } from '../model/group-tour-exectuion.model';
import { GroupTour } from '../../tour-authoring/model/group-tour.model';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';
import { Blog } from '../../blog/model/blog.model';
import { BlogService } from '../../blog/blog.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { SearchByDistance } from '../../marketplace/model/search-by-distance.model';
import { MarketplaceService } from '../../marketplace/marketplace.service';

@Component({
  selector: 'xp-explore-tours',
  templateUrl: './explore-tours.component.html',
  styleUrls: ['./explore-tours.component.css']
})
export class ExploreToursComponent implements OnInit {

  tours: Tour[] = [];
  toursCopy: Tour[] = [];
  sales: Sale[] = [];
  participations: GroupTourExecution[] = [];
  groupTours: GroupTour[] = [];
  topBlogs: Blog[] = [];

  searchCriteria: SearchByDistance = {
    maxDistance: 0,
    minDistance: 0,
    distance: 0,
    latitude: 0,
    longitude: 0,
    keyPointName: '',
    maxRating: 0,
    minRating: 0,
    maxPrice: 0,
    minPrice: 0,
    maxDuration: 0,
    minDuration: 0,
    name: '',
    tags: '',
  };
  showDiscountedOnly: boolean = false;
  isReviewsModalOpen = false;
  isSearchModalOpen = false;
  user: User;
  purchasedTours: Tour[] = [];
  selectedTourReviews: TourReview[] = [];
  isLoading = false;
  refundId: number | null = null;
  refundedTourId: number;
  visiblePopupId: number | null = null;
  disabledGroupTourParticipation = false;

  @ViewChild('popup') popup!: ElementRef;
  @ViewChild('popupParent') popupParent!: ElementRef;

  constructor(private service: TourShoppingService,
    private blogService: BlogService,
    private saleService: SaleService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef,
    private imageService: ImageService,
    private authService: AuthService,
    private tourService: TourExecutionService,
    private router: Router,
    private marketplaceService: MarketplaceService,
    private route: ActivatedRoute) {
    imageService.setControllerPath("tourist/image");
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.getTours();
    this.loadSalesData();
    this.loadPurchasedTours();
    this.loadParticipations();
    this.loadGroupTours();
    this.getTopBlogs();
    this.route.queryParams.subscribe(params => {
      const selectedTourId = params['selectedTourId'] ? Number(params['selectedTourId']) : null;
      if (selectedTourId) {
        this.refundedTourId = selectedTourId; // Koristi refundedTourId da iskoristiš isti hajlajt mehanizam
        console.log('Selected Tour ID:', this.refundedTourId);
      }
    });
    this.route.queryParams.subscribe(params => {
      this.refundId = params['refundId'] ? Number(params['refundId']) : null;
      console.log('Captured refundId:', this.refundId);

      if (this.refundId) {
        this.fetchRefundedTour(this.refundId); // Fetch the refunded tour
      }
    });
  }

  togglePopup(tourId?: number): void {
    console.log(tourId);
    if (tourId !== undefined) {
      this.visiblePopupId = this.visiblePopupId === tourId ? null : tourId;
    }
    else {
      this.visiblePopupId = null;
    }
  }

  onMouseEnter(tourId?: number): void {
    if (tourId !== undefined) {
      this.visiblePopupId = tourId;
    }
  }

  onMouseLeave(): void {
    this.visiblePopupId = null;
  }

  loadParticipations(): void {
    this.service.getAllParticipations().subscribe({
      next: (results: PagedResults<GroupTourExecution>) => {
        this.participations = results.results;
        //console.log(this.participations);
        console.log("Participations:", this.participations);
        //console.log(this.user.id);
        this.disabledGroupTourParticipation = this.participations.some(participation => participation.touristId === this.user.id);
        console.log('da li je ili nije', this.disabledGroupTourParticipation);
      },
      error: () => {
        console.log("ERROR LOADING PARTICIPATIONS");
      }
    });
  }

  loadGroupTours(): void {
    this.service.getAllGroupTours().subscribe({
      next: (results: PagedResults<GroupTour>) => {
        this.groupTours = results.results;
      },
      error: () => {
        console.log("ERROR LOADING PARTICIPATIONS");
      }
    });
  }

  getDateAndTime(t: any): Date | null {
    const groupTour = this.groupTours.find(tour => tour.id === t.id);
    if (groupTour !== undefined) {
      return groupTour.startTime;
    }
    return null;
  }

  TourParticipation(tourId?: number): boolean {
    if (tourId != undefined) {
      return this.participations.some(participation =>
        participation.touristId === this.user.id && participation.groupTourId === tourId
      );
    }
    return false;
  }

  hasAlreadyParticipated(tourId?: number): boolean {
    //console.log(this.participations);
    if (tourId != undefined) {
      return this.participations.some(participation =>
        participation.touristId === this.user.id && participation.groupTourId === tourId && participation.isFinished == true
      );
    }
    return false;
  }


  groupTourStatus(tourId?: number): boolean {
    const groupTour = this.groupTours.find(tour => tour.id === tourId);
    if (groupTour !== undefined && groupTour.startTime) {
      const currentTime = new Date();
      const tourStartTime = new Date(groupTour.startTime);
      return tourStartTime > currentTime;
    }
    return false;
  }

  groupTourProgress(tourId?: number): boolean {
    const groupTour = this.groupTours.find(tour => tour.id === tourId);
    if (groupTour !== undefined) {
      return groupTour.progress === 0;
    }
    return false;
  }

  getProgressStatus(tourId?: number): string {
    const groupTour = this.groupTours.find(tour => tour.id === tourId);
    if (groupTour !== undefined) {
      return this.getProgressLabel(groupTour.progress);
    }
    return '';
  }

  getProgressLabel(progress: number): string {
    switch (progress) {
      case 0:
        return 'Scheduled';
      case 1:
        return 'In progress';
      case 2:
        return 'Finished';
      default:
        return 'Canceled';
    }
  }

  cancelParticipation(tourId?: number): void {
    const groupTour = this.groupTours.find(tour => tour.id === tourId);
    if (groupTour) {
      const currentTime = new Date();
      const startTime = new Date(groupTour.startTime);
      const timeDifference = startTime.getTime() - currentTime.getTime();

      console.log(startTime);
      console.log(timeDifference);
      if (timeDifference > 24 * 60 * 60 * 1000) {
        console.log("Start time is more than 24 hours ago.");
        if (tourId != undefined) {
          this.service.cancelParticipation(this.user.id, tourId)
            .subscribe({
              next: (response: any) => {
                console.log('Successfully canceled the group tour:', response);
                this.loadParticipations();
              },
              error: (error: any) => {
                console.error('Error canceling the group tour:', error);
              }
            });
        }

      } else {
        alert("Start time of this tour is within 24 hours. Canceling is forbidden!");
      }
    } else {
      console.log("Tour not found.");
    }

  }

  checkPopupPosition() {
    if (this.popup && this.popupParent) {
      const popupElement = this.popup.nativeElement;
      const parentElement = this.popupParent.nativeElement;
      const parentRect = parentElement.getBoundingClientRect();
      const popupRect = popupElement.getBoundingClientRect();

      // Proveravamo da li popup izlazi izvan roditeljskog elementa
      if (popupRect.bottom > parentRect.bottom || popupRect.top < parentRect.top) {
        this.visiblePopupId = null; // Sakrij popup ako izlazi izvan okvira
      }
    }
  }

  loadSalesData(): void {
    // Fetch sales data
    this.saleService.getSales().subscribe({
      next: (results: PagedResults<Sale>) => {
        this.sales = results.results
        //console.log("Sales:", this.sales);
      },
      error: () => {
        console.log("ERROR LOADING SALES");
        this.notificationService.notify({ message: 'Failed to load sales data. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  getDiscountedPrice(tour: Tour): number {
    const sale = this.sales.find(s => s.tourIds.includes(tour.id as number));
    if (sale) {
      // Apply discount (percentage discount)
      const discountAmount = (tour.price * sale.discount) / 100;
      return tour.price - discountAmount;
    }
    return tour.price; // Return original price if no sale
  }

  searchTours(): void {
    //this.router.navigate(['/tour-search']);
    this.isSearchModalOpen = true;
  }

  searchForTours(): void {
    this.tours = this.toursCopy;
    if (this.searchCriteria.distance > 0) {
      this.marketplaceService.searchTours(this.searchCriteria).subscribe((response) => {
        this.tours = response;
        this.tourService.getReviews().subscribe({
          next: (result: PagedResults<TourReview>) => {
            this.tours.forEach(tour => {
              tour.rating = result.results.filter(review => review.tourId === tour.id).reduce((acc, review) => acc + (review.grade || 0), 0) / result.results.filter(review => review.tourId === tour.id).length;
            });
            this.searchOtherFields();
          },
          error: (error) => {
            console.error('Error fetching reviews:', error);
            this.notificationService.notify({ message: 'Failed to load reviews. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
          }
        });
      });
    } else {
      this.searchOtherFields();
    }

  }

  searchOtherFields(): void {
    const filteredTours = this.tours.filter((tour) => {
      return (
        (!this.searchCriteria.name || tour.name.includes(this.searchCriteria.name)) &&
        (!this.searchCriteria.minPrice || tour.price >= this.searchCriteria.minPrice) &&
        (!this.searchCriteria.maxPrice || tour.price <= this.searchCriteria.maxPrice) &&
        (!this.searchCriteria.minDistance || tour.transportInfo.distance >= this.searchCriteria.minDistance) &&
        (!this.searchCriteria.maxDistance || tour.transportInfo.distance <= this.searchCriteria.maxDistance) &&
        (!this.searchCriteria.tags || tour.tags.some((tag) => this.searchCriteria.tags.split(',').includes(tag))) &&
        (!this.searchCriteria.minRating || (tour.rating || 0) >= this.searchCriteria.minRating) &&
        (!this.searchCriteria.maxRating || (tour.rating || 0) <= this.searchCriteria.maxRating) &&
        (!this.searchCriteria.minDuration || tour.transportInfo.time >= this.searchCriteria.minDuration) &&
        (!this.searchCriteria.maxDuration || tour.transportInfo.time <= this.searchCriteria.maxDuration) &&
        (!this.searchCriteria.keyPointName ||
          (tour.keyPoints && tour.keyPoints.some((kp) => kp.name.includes(this.searchCriteria.keyPointName)))
        )
      );
    });

    console.log('Filtered Tours:', filteredTours);
    // Ažurirajte prikazane ture na osnovu filtera
    if (filteredTours.length === 0) {
      this.notificationService.notify({ message: 'No tours found. Please check search data.', duration: 3000, notificationType: NotificationType.INFO });
      this.tours = this.toursCopy;
    } else {
      this.tours = filteredTours;
      this.isSearchModalOpen = false;
    }
    if (this.selectedSort !== 'default') {
      this.onSortChange(this.selectedSort);
    }
  }

  resetSearch(): void {
    this.searchCriteria = {
      maxDistance: 0,
      minDistance: 0,
      distance: 0,
      latitude: 0,
      longitude: 0,
      keyPointName: '',
      maxRating: 0,
      minRating: 0,
      maxPrice: 0,
      minPrice: 0,
      maxDuration: 0,
      minDuration: 0,
      name: '',
      tags: '',
    };
    this.tours = this.toursCopy;
  }

  onKeyPointSelected(event: { latitude: number, longitude: number }): void {
    this.searchCriteria.latitude = event.latitude;
    this.searchCriteria.longitude = event.longitude;
    console.log('Odabrana tačka za pretragu:', this.searchCriteria.latitude, this.searchCriteria.longitude);
  }

  closeSearchModal(): void {
    this.isSearchModalOpen = false;
  }

  fetchRefundedTour(refundId: number): void {
    this.service.getRefundedTour(refundId).subscribe({
      next: (refundedTourId: number) => {
        this.refundedTourId = refundedTourId; // Assign the value from the observable
        console.log('Refunded Tour ID:', this.refundedTourId);
      },
      error: (err) => {
        console.error('Error fetching refunded tour ID:', err);
        this.notificationService.notify({ message: 'Failed to fetch refunded tour ID.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  getFilteredTours() {
    if (this.showDiscountedOnly) {
      return this.tours.filter(tour => this.getDiscountedPrice(tour) !== tour.price);
    }
    return this.tours;
  }

  // This method toggles the filter
  toggleDiscountFilter() {
    this.showDiscountedOnly = !this.showDiscountedOnly;
  }

  getTours(): void {
    this.isLoading = true
    if (this.user.role == "tourist") {
      this.service.getTours().subscribe({
        next: (result: Array<Tour>) => {
          this.tours = result;
          //console.log(this.tours)
          this.isLoading = false;
          this.getAllReviews();
          // Assign a single key point to each tour
          this.tours.forEach(tour => {
            this.assignSingleKeyPoint(tour);
          });
          this.toursCopy = this.tours;
        },
        error: (err: any) => {
          console.log(err);
          this.isLoading = false
          this.notificationService.notify({ message: 'Failed to load tours. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });
    } else {
      this.service.getTours().subscribe({
        next: (result: Array<Tour>) => {
          this.tours = result;
          //console.log(this.tours)
          this.isLoading = false;
          // Assign a single key point to each tour
          this.tours.forEach(tour => {
            this.assignSingleKeyPoint(tour);
          });

        },
        error: (err: any) => {
          console.log(err);
          this.isLoading = false
          this.notificationService.notify({ message: 'Failed to load tours. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });
    }
  }

  private loadPurchasedTours(): void {
    this.isLoading = true;
    if (this.user.role == "tourist") {
      this.service.getPurchasedTours().subscribe({
        next: (tours: Tour[]) => {
          this.purchasedTours = tours;
          this.isLoading = false
        },
        error: (err) => {
          console.error('Failed to load purchased tours:', err);
          this.isLoading = false;
          this.notificationService.notify({ message: 'Failed to load purchased tours. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });
    }
  }

  assignSingleKeyPoint(tour: Tour): void {
    if (tour.id !== undefined) { // Ensure tour.id is defined
      this.service.getKeyPoints().subscribe(keyPoints => {
        const keyPoint = keyPoints.find(kp => kp.tourIds.includes(tour.id!)); // Use `!` after `tour.id`
        if (keyPoint) {
          if (!tour.keyPoints) {
            tour.keyPoints = []; // Initialize `keyPoints` if it is undefined
          }
          tour.keyPoints[0] = keyPoint; // Assign the first matching key point
        }
      });
    } else {
      console.error('Tour ID is undefined');
    }
  }

  addToCart(tourId: number, tourName: string, price: number): void {

    // Define the cart key based on the user ID
    const cartKey = `cart_${this.user.id}`;

    // Get the existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    // Check if the item already exists in the cart
    const existingItem = cart.find((item: { tourId: number }) => item.tourId === tourId);

    if (existingItem) {
      console.log('Item already in cart');
      this.notificationService.notify({ message: 'Tour is already in cart.', duration: 3000, notificationType: NotificationType.INFO });
    } else {
      // If item does not exist, add it with quantity 1
      const newItem: OrderItem = { tourId, tourName, price };
      cart.push(newItem);
      console.log("Added to cart");
      console.log(`Tour with ID ${tourId} added to cart for user ${this.user.username}`);
      this.notificationService.notify({
        message: 'Tour added to cart successfully!', duration: 3000, notificationType: NotificationType.SUCCESS, action: 'View Cart', actionCallback: () =>
          this.router.navigate(['/cart'])
      });
    }

    // Update the cart in localStorage
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  isTourInCart(id: number): boolean {
    const cartKey = `cart_${this.user.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    //console.log(cart.some((item: { tourId: number }) => item.tourId === id))
    return cart.some((item: { tourId: number }) => item.tourId === id);
  }

  isPurchased(tourId: number): boolean {
    return this.purchasedTours.some(tour => tour.id === tourId);
  }

  showReviews(tourId: number): void {
    this.isReviewsModalOpen = true;
    this.getReviews(tourId);
  }

  closeReviewsModal(): void {
    this.isReviewsModalOpen = false;
  }

  getReviews(tourId: number): void {
    this.tourService.getReviews().subscribe({
      next: (result: PagedResults<TourReview>) => {
        this.selectedTourReviews = result.results.filter(review => review.tourId === tourId);
        this.getImages();
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.notificationService.notify({ message: 'Failed to load reviews. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  getAllReviews(): void {
    this.tourService.getReviews().subscribe({
      next: (result: PagedResults<TourReview>) => {
        this.tours.forEach(tour => {
          tour.rating = result.results.filter(review => review.tourId === tour.id).reduce((acc, review) => acc + (review.grade || 0), 0) / result.results.filter(review => review.tourId === tour.id).length;
        });
        this.toursCopy = this.tours;
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.notificationService.notify({ message: 'Failed to load reviews. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  getImages(): void {
    for (const review of this.selectedTourReviews) {
      review.reviewImages = [];
      this.imageService.setControllerPath("tourist/image");
      review.images.split(',').forEach(element => {
        this.imageService.getImage(Number(element).valueOf()).subscribe((blob: Blob) => {
          //console.log(blob);  // Proveri sadržaj Blob-a
          if (blob.type.startsWith('image')) {
            review.reviewImages?.push(URL.createObjectURL(blob));
            this.cd.detectChanges();
          } else {
            console.error("Blob nije slika:", blob);
          }
        });

      });
      //kraj
    }
  }

  participateInGroupTour(tourId: number) {
    const groupTourExecution: GroupTourExecution = {
      groupTourId: tourId,
      touristId: this.user.id,
      isFinished: false
    };

    console.log(groupTourExecution);
    this.service.groupTourParticipate(groupTourExecution)
      .subscribe({
        next: (response) => {
          console.log('Successfully joined the group tour:', response);
          this.loadParticipations();
        },
        error: (error) => {
          console.error('Error joining the group tour:', error);
        }
      });
  }


  getTopBlogs(): void {
    this.isLoading = true;
    this.blogService.getTopBlogs().subscribe({
      next: (result: Blog[]) => {
        this.topBlogs = result;
        //console.log("blogoviiiiiiiiiii" + this.topBlogs);
        this.topBlogs.forEach(element => {
          // Fetch image separately
          if (element.imageId) {
            this.fetchImage(element.imageId).then((imageUrl) => {
              element.image = imageUrl;
            }).catch((err) => {
              console.error('Error fetching image:', err);
            }).finally(() => {
              this.isLoading = false; // Always stop loading regardless of image fetch result
            });
          }
        });
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.notify({ message: 'Failed to load top blogs. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  fetchImage(imageId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.imageService.getImage(imageId).subscribe({
        next: (blob: Blob) => {
          if (blob.type.startsWith('image')) {
            resolve(URL.createObjectURL(blob)); // Resolve with image URL
          } else {
            reject(new Error('Blob is not an image'));
          }
        },
        error: (err) => {
          reject(err); // Reject on error
        }
      });
    });
  }

  viewBlog(blogId: any) {
    // Navigate to the blog's detail page or open the blog
    this.router.navigate(['/comments/', blogId]); // Assuming you have routing set up
  }

  selectedSort: string = 'default';

  onSortChange(event: any) {
    this.selectedSort = event;
    if (event == 'default') {
      this.getTours();
    } else {
      this.getSortedTours();
    }
  }

  getSortedTours() {
    return this.tours.sort((a, b) => {
      b.rating = b.rating ? b.rating : 0;
      a.rating = a.rating ? a.rating : 0;
      switch (this.selectedSort) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'lengthAsc':
          return a.transportInfo.time - b.transportInfo.time;
        case 'lengthDesc':
          return b.transportInfo.time - a.transportInfo.time;
        case 'distanceAsc':
          return a.transportInfo.distance - b.transportInfo.distance;
        case 'distanceDesc':
          return b.transportInfo.distance - a.transportInfo.distance;
        case 'ratingDesc':
          return b.rating - a.rating;
        case 'ratingAsc':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }

}
