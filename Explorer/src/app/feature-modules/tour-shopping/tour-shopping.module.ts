import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { ExploreToursComponent } from './explore-tours/explore-tours.component';
import { PurchasedToursComponent } from './purchased-tours/purchased-tours.component';
import { WalletComponent } from './wallet/wallet.component';
import { BundleComponent } from './bundles/bundle.component';
import { BundleCreateComponent } from './bundle-create/bundle-create.component';
import { FormsModule } from '@angular/forms';
import { ExploreBundlesComponent } from './explore-bundles/explore-bundles.component';
import { SalesComponent } from './sales/sales.component';
import { SaleCreationComponent } from './sales-create/sales-create.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BundleToursComponent } from './bundle-tours/bundle-tours.component';
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  declarations: [
    SaleCreationComponent,
    SalesComponent,
    ShoppingCartComponent,
    ExploreToursComponent,
    PurchasedToursComponent,
    WalletComponent,
    BundleComponent,
    BundleCreateComponent,
    ExploreBundlesComponent,
    BundleToursComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatTooltipModule,
    SharedModule
]
})
export class TourShoppingModule { }
