import { RejectionType } from "shared/services";
import { BrokerDNrom, CustomerDNorm, SystemUserDNorm } from "../../entities";

export class LeadRejectedOfferList {

    id!: string
    leadNo!: number;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    rejectionType: string;
    createdDate!: Date
    totalStones!: number;

    constructor() {
        this.rejectionType = RejectionType.LeadReject.toString();
    }
}