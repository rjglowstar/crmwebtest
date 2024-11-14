import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ContactUs } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
  public apiUrl = keys.apiUrl + "ContactUs/";

  constructor(private http: HttpClient) { }

  public async insertContactUs(contactUsObj: ContactUs): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "InsertContactUs", contactUsObj, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }

}