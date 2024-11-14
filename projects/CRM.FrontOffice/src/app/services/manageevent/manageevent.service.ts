import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ManageEventCriteria } from '../../businessobjects';
import { ManageEvent } from '../../entities';



@Injectable({
  providedIn: 'root'
})
export class ManageEventService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + "ManageEvent/";
  }

  public async getAllEvents(): Promise<ManageEvent[]> {
    const get$ = this.http.get(this.baseUrl + "GetAll");

    var result = await lastValueFrom(get$) as ManageEvent[];
    return result;
  }

  public async getFilteredEvents(manageEventCriteria: ManageEventCriteria): Promise<ManageEvent[]> {
    const post$ = this.http.post(this.baseUrl + "GetFiltered", manageEventCriteria);

    var result = await lastValueFrom(post$) as ManageEvent[];
    return result;
  }


  public async insertEvent(manageEvent: ManageEvent): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "Insert", manageEvent, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async UpdateEvent(manageEvent: ManageEvent): Promise<string> {
    manageEvent.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.baseUrl + "Update", manageEvent, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async deleteEvent(eventId: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "Delete/" + eventId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

}
