import { Appointment } from "../../entities";

export class AppointmentResponse {
    appointments: Appointment[]    
    totalCount!: number   

    constructor() {
        this.appointments = []; 
    }
}