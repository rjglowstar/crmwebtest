import { InvItem } from "..";
import { CustomerDNorm, SystemUserDNorm } from "../../entities";

export class LeadCartItem {

    customer!: CustomerDNorm
    seller!: SystemUserDNorm
    invItems!: InvItem[]
    totalPcs: number = 0;
    totalCarat: number = 0;
    totalAmount: number = 0;

    constructor() {
        this.invItems = new Array<InvItem>();
    }
}