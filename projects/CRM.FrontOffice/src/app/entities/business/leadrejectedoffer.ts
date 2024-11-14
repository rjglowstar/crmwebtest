import { BaseEntity } from "shared/enitites";
import { RejectionType } from "shared/services";
import { BrokerDNrom, CustomerDNorm, LeadRejectedOfferItem, SystemUserDNorm } from "..";

export class LeadRejectedOffer extends BaseEntity {

    leadNo!: number;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    rejectedInvItems: Array<LeadRejectedOfferItem>;
    rejectionType: string;
    holdDate!: Date;

    constructor() {
        super();
        this.rejectedInvItems = new Array<LeadRejectedOfferItem>();
        this.rejectionType = RejectionType.LeadReject.toString();
    }
}