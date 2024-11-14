import { BaseEntity } from "shared/enitites"
import { CustomerDNorm } from "../../entities";

export class BidingItems extends BaseEntity {
    stoneId!: string;
    bidNumber!: string;
    discount!: number;
    bidAmount!: number;
    bidPerCT!: number;
    customer!: CustomerDNorm;
    isApproved!: boolean;
    approvedBy!: string;
    approvedDate!: Date;

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.isApproved = false;
    }
}