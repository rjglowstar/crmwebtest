import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { DateSearchFilter, Weeklysummarydropdowndata } from '../../businessobjects';
import { WeeklySummary } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class WeeklysummaryService {

  constructor(private http: HttpClient) { }

  public async getPrevSummary(): Promise<Weeklysummarydropdowndata[]> {
    const get$ = this.http.get(keys.apiUrl + "WeeklySummary/GetPrevSummary");

    var result = await lastValueFrom(get$) as Weeklysummarydropdowndata[];
    return result;
  }

  public async getWeeklySummary(dateFilter: DateSearchFilter): Promise<WeeklySummary> {
    const post$ = this.http.post(keys.apiUrl + "WeeklySummary/GetSummary", dateFilter);

    var result = await lastValueFrom(post$) as WeeklySummary;
    return result;
  }

  public async getSummaryById(id: string): Promise<WeeklySummary> {
    const get$ = this.http.get(keys.apiUrl + "WeeklySummary/GetSummaryById/" + id);

    var result = await lastValueFrom(get$) as WeeklySummary;
    return result;
  }

  public async checkSummary(dateFilter: DateSearchFilter): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "WeeklySummary/CheckSummary", dateFilter);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async insertSummary(summary: WeeklySummary): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "WeeklySummary/InsertSummary", summary, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async confirmKapan(summaryId: string, kapanName: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + "WeeklySummary/ConfirmKapan/" + summaryId + "/" + kapanName);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async confirmMultiKapan(summaryId: string, kapanName: string[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "WeeklySummary/ConfirmMultipleKapan/" + summaryId, kapanName);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }
}
