import { CustomerDNorm } from "../../customer/dnorm/customerdnorm";
import { PriceDNorm } from "../../inventory/priceDNorm";
import { SystemUserDNorm } from "../../organization/dnorm/systemuserdnorm"

export class LeadStoneReleaseItem {
    leadNo!: number;
    customer: CustomerDNorm
    seller: SystemUserDNorm
    stoneId!: string
    invId!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    status!: string
    price!: PriceDNorm

    // extra
    sellerName!: string;

    constructor() {
        this.seller = new SystemUserDNorm();
        this.price = new PriceDNorm();
        this.customer = new CustomerDNorm();
    }
}