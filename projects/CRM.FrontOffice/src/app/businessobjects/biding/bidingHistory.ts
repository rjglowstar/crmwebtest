import { CustomerDNorm } from "../../entities"
import { InvDetailItem } from "../../entities/inventory/invDetailItem"

export class BidingHistory {
    totalStones!: number
    totalPerCarat!: number
    totalAmount!: number
    totalWeight!: number
    invDetailItems!: InvDetailItem[]
    customer!: CustomerDNorm;

    constructor() {
        this.invDetailItems = new Array<InvDetailItem>();
        this.customer = new CustomerDNorm();
    }
}