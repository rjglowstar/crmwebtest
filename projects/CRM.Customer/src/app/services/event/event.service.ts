import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ManageEvent } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + "ManageEvent/";
  }

  public async getAllEvents(): Promise<ManageEvent[]> {
    const get$ = this.http.get(this.baseUrl + "GetAll");

    var result = await lastValueFrom(get$) as ManageEvent[];
    return result;
  }

  public async getbyId(eventID: string): Promise<ManageEvent> {
    const get$ = this.http.get(this.baseUrl + "GetEventById/" + eventID);

    var result=await lastValueFrom(get$) as ManageEvent;
    return result;
  }

  public async getCurrentEvent(): Promise<ManageEvent> {
    const get$ = this.http.get(this.baseUrl + "GetCurrentEvent");

    var result = await lastValueFrom(get$) as ManageEvent;
    return result;
  }

  public async getAllUpcomingEvents(): Promise<ManageEvent[]> {
    const get$ = this.http.get(this.baseUrl + "GetAllUpcomingEvents");

    var result = await lastValueFrom(get$) as ManageEvent[];
    return result;
  }

  public async getLastFivePreviEvents(): Promise<ManageEvent[]> {
    const get$ = this.http.get(this.baseUrl + "GetFivePreviousEvents");

    var result = await lastValueFrom(get$) as ManageEvent[];
    return result;
  }
}
