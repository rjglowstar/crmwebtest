import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { ChangePasswordModel, RemoveUserModel, User } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class ManageService {
  controllerPath: string = 'Manage/';

  constructor(private http: HttpClient) { }

  async getAllUsers(): Promise<User[]> {
    const get$ = this.http.get(environment.apiIdentityUrl + this.controllerPath + "GetAll");

    var result = await lastValueFrom(get$) as User[];
    return result;
  }

  async getUserByMailId(mailId: string): Promise<User[]> {
    const get$ = this.http.get(environment.apiIdentityUrl + this.controllerPath + "GetUserByMailId/" + mailId);

    var result = await lastValueFrom(get$) as User[];
    return result;
  }

  async removeteUser(removeUser: RemoveUserModel): Promise<any> {
    const post$ = this.http.post(environment.apiIdentityUrl + this.controllerPath + "RemoveUser", removeUser, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async ChangePassword(Item: ChangePasswordModel): Promise<string> {
    const post$ = this.http.post(environment.apiIdentityUrl + this.controllerPath + "ChangePassword", Item, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }
}