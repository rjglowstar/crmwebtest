import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { CommonResponse } from "shared/businessobjects";
import { ExportToExcelMailData } from "../../businessobjects";

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  public apiUrl = keys.apiUrl + "Email/";

  constructor(private http: HttpClient) { }

  public async sendEmailAsync(data: ExportToExcelMailData): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiUrl + "SendFromMyCart", data);

    var result=await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async sendPlaceBidEmailAsync(data: ExportToExcelMailData): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiUrl + "SendPlaceBidEmail", data);

    var result=await lastValueFrom(post$) as CommonResponse;
    return result;
  }
}