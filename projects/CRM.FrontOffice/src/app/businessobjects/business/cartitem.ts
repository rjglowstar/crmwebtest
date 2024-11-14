import { CustomerDNorm, InvItem, SystemUserDNorm } from "../../entities";

export class CartItem {
    id!: string
    customer!: CustomerDNorm
    seller!: SystemUserDNorm
    invItem!: InvItem
    stoneId!: string
    WebPlatform!: string

    //for grouping
    customerName!: string
    netAmount!: number
    totalWeight!: number

    constructor() {
        this.customer = new CustomerDNorm();
        this.seller = new SystemUserDNorm();
    }
}