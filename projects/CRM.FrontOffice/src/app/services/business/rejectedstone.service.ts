import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { RejectedStoneResponse, RejectedStoneSearchCriteria } from '../../businessobjects';
import { RejectedStone } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class RejectedstoneService {

  public controllerName: string = "RejectedStone";
  constructor(private http: HttpClient) { }

  public async getAllRejectedStones(): Promise<RejectedStone[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetAll");

    var result = await lastValueFrom(get$) as RejectedStone[];
    return result;
  }

  public async getRejectedStone(rejectedStoneSearchCriteria: RejectedStoneSearchCriteria, skip: number, take: number): Promise<RejectedStoneResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetPaginated/" + skip + "/" + take, rejectedStoneSearchCriteria);

    var result = await lastValueFrom(post$) as RejectedStoneResponse;
    return result;
  }

  public async Insert(Data: RejectedStone): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/Insert", Data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async InsertList(Data: RejectedStone[]): Promise<RejectedStone[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/InsertList", Data);

    var result = await lastValueFrom(post$) as RejectedStone[];
    return result;
  }

  public async Update(Data: RejectedStone): Promise<string> {
    Data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerName + "/Update", Data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async delete(Id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerName + "/Delete/" + Id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

}