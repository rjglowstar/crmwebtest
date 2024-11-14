import { CustomerDNorm } from "../customer/dnorm/customerdnorm";

export class InvDistribution {
    customer: CustomerDNorm;
    priority!: number;
    includeInBusiness!: boolean;

    constructor(){
        this.customer = new CustomerDNorm();
    }
}