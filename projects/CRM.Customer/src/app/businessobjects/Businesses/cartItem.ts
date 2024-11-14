import { InvItem } from ".."
import { CustomerDNorm } from "../../entities/customer/dnorm/customerdnorm"
import { SystemUserDNorm } from "../../entities/organization/dnorm/systemuserdnorm"


export class CartItem {
    id!: string
    customer!: CustomerDNorm
    seller!: SystemUserDNorm
    invItem!: InvItem
    stoneId!: string
    WebPlatform!: string

    constructor() {
        this.customer = new CustomerDNorm();
        this.seller = new SystemUserDNorm();
    }
}