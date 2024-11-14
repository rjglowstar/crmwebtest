import { BaseEntity } from "shared/enitites"
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";

export class BidingItems extends BaseEntity {
    stoneId!: string;
    bidNumber!: string;
    discount!: number;
    bidAmount!: number;
    bidPerCT!: number;
    customer!: CustomerDNorm;
    isApproved!: boolean;

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.isApproved = false;
    }
}