import { BaseEntity } from "shared/enitites";
import { IdentityDNorm } from "../inventory/identityDNorm";
import { CustomerDNorm } from "./dnorm/customerdnorm";

export class Appointment extends BaseEntity {
    customer: CustomerDNorm;
    stoneIds!: string[];
    purpose!: string;
    Status!: string;
    appointmentDate!: Date | null;
    appointmentTime!: Date | null;
    approvedByIdentity?: IdentityDNorm | null;
    approvedDate!: Date | null;

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.approvedByIdentity = null;
    }
}