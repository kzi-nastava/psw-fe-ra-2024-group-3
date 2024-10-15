import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { EquipmentComponent } from 'src/app/feature-modules/administration/equipment/equipment.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { TourComponent } from 'src/app/feature-modules/tour-authoring/tour/tour.component';
import { TourFormComponent } from 'src/app/feature-modules/tour-authoring/tour-form/tour-form.component'; 
import { UserRatingComponent } from 'src/app/feature-modules/layout/user-rating/user-rating.component';
import { RatingsListComponent } from 'src/app/feature-modules/layout/ratings-list/ratings-list.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'equipment', component: EquipmentComponent, canActivate: [AuthGuard] },
  { path: 'tours', component: TourComponent, canActivate: [AuthGuard] },
  { path: 'add-tour', component: TourFormComponent, canActivate: [AuthGuard] }, 
  { path: 'user-rating', component: UserRatingComponent, canActivate: [AuthGuard] }, 
  { path: 'ratings-list', component: RatingsListComponent, canActivate: [AuthGuard] }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
