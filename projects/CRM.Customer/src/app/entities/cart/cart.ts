import { CustomerDNorm } from "../customer/dnorm/customerdnorm"
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm"

export class Cart {
    customer!: CustomerDNorm
    seller!: SystemUserDNorm
    invId!: string
    stoneId!: string
    WebPlatform!: string

    constructor() {
        this.customer = new CustomerDNorm();
        this.seller = new SystemUserDNorm();
     }
}