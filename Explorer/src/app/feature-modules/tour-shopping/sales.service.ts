import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Sale } from "./model/sale.model";
import { environment } from "src/env/environment";
import { PagedResults } from "src/app/shared/model/paged-results.model";

@Injectable({
    providedIn: 'root'
})
export class SaleService {
    constructor(private http: HttpClient) {}

    getSalesByAuthorId(authorId: number): Observable<PagedResults<Sale>> {
        return this.http.get<PagedResults<Sale>>(environment.apiHost + 'author/sale/' + authorId)
    }

    getSales(): Observable<PagedResults<Sale>> {
        return this.http.get<PagedResults<Sale>>(environment.apiHost + 'author/sale')
    }

    createSale(sale: Sale): Observable<Sale> {
        console.log(sale)
        return this.http.post<Sale>(environment.apiHost + 'author/sale', sale);
    }

    deleteSale(id: number): Observable<Sale> {
        return this.http.delete<Sale>(environment.apiHost + 'author/sale/' + id);
    }

    updateSale(sale: Sale): Observable<Sale> {
        console.log("ID JE: " + sale.id)
        console.log(sale)
        return this.http.put<Sale>(environment.apiHost + 'author/sale/' + sale.id, sale);
    }
}