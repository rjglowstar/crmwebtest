import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { GradeSearchItems, IncMeasureGradeLookup } from '../../businessobjects';

@Injectable({
    providedIn: 'root'
})

export class MeasureGradeService {

    constructor(private http: HttpClient) { }

    async getPrice(data: GradeSearchItems[]): Promise<IncMeasureGradeLookup[]> {
        var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
        let jsonData = JSON.stringify(data);
        const post$ = this.http.post(environment.apiPricingUrl + 'MeasureGrade/GetBothGrade', jsonData, { headers: reqHeader });

        var result=await lastValueFrom(post$) as IncMeasureGradeLookup[];
        return result;
    }

}