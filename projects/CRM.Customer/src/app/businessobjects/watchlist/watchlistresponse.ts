import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "../../entities/customer/dnorm/customerdnorm";
import { InvDetailData } from "../inventory/invdetaildata";

export class WatchListResponse extends BaseEntity {
    invItemId!: string
    invItemNumber!: string
    oldDiscount?: number
    inventoryDetail: InvDetailData
    customer: CustomerDNorm
    addedAt!: Date

    constructor() {
        super();
        this.inventoryDetail = new InvDetailData();
        this.customer = new CustomerDNorm();
    }
}