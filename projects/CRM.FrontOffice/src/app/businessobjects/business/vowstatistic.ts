import { CustomerDNorm, SystemUserDNorm } from "../../entities";

export class VowStatistic {
    customer: CustomerDNorm;
    seller: SystemUserDNorm;
    lastNetAmount!: number;
    maxVOWDiscPer!: number;
    lastTotalVOWDiscPer!: number;
    lastTotalVOWDiscAmount!: number;
    lastTotalPayableAmount!: number;
    lastYearNetAmount!: number;
    nextEligibleVOWDiscount!: number;
    lastPurchaseDate!: string;

    constructor(){
        this.customer = new CustomerDNorm();
        this.seller = new SystemUserDNorm();
    }
}