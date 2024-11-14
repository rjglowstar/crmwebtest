import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { AppointmentResponse, AppointmentSearchCriteria } from '../../businessobjects';
import { Appointment } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  public apiUrl = keys.apiUrl + "Appointment/";

  constructor(private http: HttpClient) { }

  public async getAppointments(searchCriteria: AppointmentSearchCriteria, skip: number, take: number): Promise<AppointmentResponse> {
    const post$ = this.http.post(this.apiUrl + "GetPaginated/" + skip + "/" + take, searchCriteria);

    var result = await lastValueFrom(post$) as AppointmentResponse;
    return result;
  }

  public async AppointmentInsert(appointment: Appointment): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "InsertAppointment", appointment, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async AppointmentStatusUpdate(appointment: Appointment): Promise<boolean> {
    appointment.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.apiUrl + "UpdateAppointmentStatus", appointment);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

}