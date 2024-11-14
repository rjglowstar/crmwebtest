import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ExpoTickets } from '../../entities/inventory/expotickets';

@Injectable({
    providedIn: 'root'
})

export class ExpoTicketService {
    api: string = keys.apiUrl + "ExpoTicket/";

    constructor(private http: HttpClient) { }

    public async getExpoTicketByCode(ticketCode: number): Promise<ExpoTickets> {
        const get$ = this.http.get(keys.apiUrl + "ExpoTicket/GetByTicketCode/" + ticketCode);

        var result=await lastValueFrom(get$) as ExpoTickets;
        return result;
    }
}