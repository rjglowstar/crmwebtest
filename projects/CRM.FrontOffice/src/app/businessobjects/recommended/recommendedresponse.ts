import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "../../entities/customer/dnorm/customerdnorm";
import { InvDetailData } from "../inventory/invdetaildata";

export class RecommendedResponse extends BaseEntity {
    invItemId!: string
    invItemNumber!: string    
    inventoryDetail: InvDetailData
    customer: CustomerDNorm   
    endDate!: Date   

    constructor() {
        super();
        this.inventoryDetail = new InvDetailData();
        this.customer = new CustomerDNorm();
    }
}