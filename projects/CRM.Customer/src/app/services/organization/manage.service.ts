import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { ChangePasswordModel, User } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class ManageService {
  controllerPath: string = 'Manage/';

  constructor(private http: HttpClient) { }

  async getUserByMailId(mailId: string): Promise<User[]> {
    const get$ = this.http.get(environment.apiIdentityUrl + this.controllerPath + "GetUserByMailId/" + mailId);

    var result = await lastValueFrom(get$) as User[];
    return result;
  }

  public async ChangePassword(Item: ChangePasswordModel): Promise<string> {
    const post$ = this.http.post(environment.apiIdentityUrl + this.controllerPath + "ChangePassword", Item, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }
}