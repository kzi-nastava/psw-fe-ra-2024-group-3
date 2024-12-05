import { Component } from '@angular/core';
import { Sale } from '../model/sale.model';
import { SaleService } from '../sales.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
})
export class SalesComponent {
    constructor(
        private salesService: SaleService
    ) {}
    updatedSale: Sale | null = null;
    sales: Sale[];

    ngOnInit(): void {
        this.getSales()
    }

    getSales(): void {
        this.salesService.getSales().subscribe({
            next: ( results: PagedResults<Sale> ) => {
                this.sales =results.results
                console.log("Sales:", this.sales); 
            },
            error: () => {
                console.log("ERROR LOADING SALES");
            }
        });
    }

    onInputChange(sale: Sale): void {
        // If a sale is being updated, mark it as the modified one
        if (this.updatedSale === null || this.updatedSale.id !== sale.id) {
          // Store the original values (startTime and endTime)
          this.updatedSale = { 
            ...sale,  // Copy all fields
            startTime: sale.startTime,  // Keep original startTime
            endTime: sale.endTime,      // Keep original endTime
          };
        }
      }

    deleteSale(id: number | undefined): void {
        this.salesService.deleteSale(id as number).subscribe({
            next: () => {
                console.log("USPESNO DELETEOVAN")
                this.getSales()
            },
            error: () => {
                console.log("Error deleting sale");
            }
        });
    }

    isSaleUpdated(sale: Sale): boolean {
        return this.updatedSale?.id === sale.id 
            && (this.updatedSale?.discount !== sale.discount || this.updatedSale.endTime !== sale.endTime);
    }
    
    minDate(): string {
        const today = new Date();
        return today.toISOString().slice(0, 16); 
    }

    updateSale(sale: Sale): void {
        if (!this.isSaleUpdated(sale)) return;
    
        const updatedSale: Sale = {
          ...sale,
          discount: this.updatedSale?.discount as number,
          endTime: this.updatedSale?.endTime,
        };
    
        this.salesService.updateSale(updatedSale).subscribe({
          next: () => {
            console.log('Sale updated:', updatedSale);
            this.updatedSale = null;
          },
          error: () => {
            console.log("Error updating sale");
          }
        });
    }
}
